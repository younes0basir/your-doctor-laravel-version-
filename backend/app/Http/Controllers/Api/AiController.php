<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Doctor;
use App\Models\Appointment;

class AiController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array',
            'context_doctors' => 'nullable|array' // doctors from previous recommendations
        ]);

        $apiKey = env('NVIDIA_API_KEY');
        $model = env('NVIDIA_AI_MODEL', 'meta/llama-3.1-8b-instruct');
        $apiUrl = env('NVIDIA_AI_URL', 'https://integrate.api.nvidia.com/v1/chat/completions');

        // Fetch actual specialties that have doctors
        $specialties = Doctor::where('status', 'approved')
            ->distinct()
            ->pluck('specialty')
            ->toArray();
            
        if (empty($specialties)) {
            $specialties = ['Generalist'];
        }

        // Detect booking intent BEFORE calling AI (save time & tokens)
        $bookingIntent = $this->detectBookingIntent($request->message, $request->context_doctors ?? []);
        
        if ($bookingIntent) {
            return $this->handleBookingIntent($bookingIntent, $request);
        }
        
        // Language detection
        $isArabic = preg_match('/[\x{0600}-\x{06FF}]/u', $request->message);
        
        $systemPrompt = $isArabic 
            ? "أنت MediAI. أجب باختصار شديد (جملتين فقط). اقترح تخصصًا واحدًا فقط من: " . implode(', ', $specialties)
            : "You are MediAI. Be extremely concise (max 2 sentences). Suggest ONLY one specialty from: " . implode(', ', $specialties) . ". Disclaimer: AI Assistant - Not a diagnosis.";

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        // Add history (last 2 for speed)
        if ($request->history) {
            foreach (array_slice($request->history, -2) as $msg) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content']
                ];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $request->message];

        try {
            $response = Http::timeout(60) // Increased to 60s to avoid early timeouts
                ->withOptions(['verify' => false])
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])->post($apiUrl, [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.1,
                'top_p' => 0.7,
                'max_tokens' => 1024, // Matched your fast snippet
            ]);

            if ($response->successful()) {
                $aiResponse = $response->json()['choices'][0]['message']['content'];
                
                // Extract specialty
                $suggestedSpecialty = null;
                foreach ($specialties as $specialty) {
                    if (preg_match('/\b' . preg_quote($specialty, '/') . '\b/i', $aiResponse)) {
                        $suggestedSpecialty = $specialty;
                        break;
                    }
                }

                $recommendedDoctors = [];
                if ($suggestedSpecialty) {
                    $recommendedDoctors = Doctor::with('user')
                        ->where('specialty', $suggestedSpecialty)
                        ->where('status', 'approved')
                        ->limit(3)
                        ->get()
                        ->map(function($doctor) {
                            return [
                                'id' => $doctor->id,
                                'name' => 'Dr. ' . ($doctor->user->first_name ?? '') . ' ' . ($doctor->user->last_name ?? ''),
                                'specialty' => $doctor->specialty,
                                'image' => $doctor->profile_picture,
                                'experience' => $doctor->experience_years . ' years',
                                'fee' => $doctor->consultation_fee
                            ];
                        });
                }

                return response()->json([
                    'reply' => $aiResponse,
                    'suggested_specialty' => $suggestedSpecialty,
                    'recommended_doctors' => $recommendedDoctors
                ]);
            }

            return response()->json([
                'error' => 'AI Service temporarily slow or unavailable',
                'details' => $response->body()
            ], $response->status());

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'error' => 'Connection to AI timed out',
                'message' => 'The AI service is taking too long to respond. Please try again.'
            ], 504);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while connecting to AI',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Detect if the user's message is a booking request.
     * This runs LOCALLY (no AI call needed) for instant response.
     */
    private function detectBookingIntent($message, $contextDoctors = [])
    {
        $msg = strtolower($message);
        
        // Booking keywords in multiple languages
        $bookingKeywords = [
            'book', 'reserve', 'appointment', 'schedule',
            'réserver', 'rendez-vous', 'prendre rdv',
            'حجز', 'موعد', 'نحجز',
            'reservi', 'hejz', 'bghit nhejz', 'dir liya', 'rdv'
        ];
        
        $hasBookingIntent = false;
        foreach ($bookingKeywords as $keyword) {
            if (strpos($msg, $keyword) !== false) {
                $hasBookingIntent = true;
                break;
            }
        }
        
        if (!$hasBookingIntent) return null;

        // Try to find which doctor they want
        $doctorId = null;
        $doctorName = null;
        
        // Check against context doctors (from previous AI recommendations)
        foreach ($contextDoctors as $doc) {
            $name = strtolower($doc['name'] ?? '');
            // Check if any part of the doctor's name is mentioned
            $nameParts = explode(' ', str_replace('dr. ', '', $name));
            foreach ($nameParts as $part) {
                if (strlen($part) > 2 && strpos($msg, strtolower($part)) !== false) {
                    $doctorId = $doc['id'];
                    $doctorName = $doc['name'];
                    break 2;
                }
            }
        }
        
        // If no doctor found from context, search DB
        if (!$doctorId) {
            $doctors = Doctor::with('user')->where('status', 'approved')->get();
            foreach ($doctors as $doc) {
                $lastName = strtolower($doc->user->last_name ?? '');
                $firstName = strtolower($doc->user->first_name ?? '');
                if (($lastName && strlen($lastName) > 2 && strpos($msg, $lastName) !== false) ||
                    ($firstName && strlen($firstName) > 2 && strpos($msg, $firstName) !== false)) {
                    $doctorId = $doc->id;
                    $doctorName = 'Dr. ' . ($doc->user->first_name ?? '') . ' ' . ($doc->user->last_name ?? '');
                    break;
                }
            }
        }

        // Parse date
        $date = $this->parseDate($msg);
        
        // Parse time
        $time = $this->parseTime($msg);

        return [
            'is_booking' => true,
            'doctor_id' => $doctorId,
            'doctor_name' => $doctorName,
            'date' => $date,
            'time' => $time,
        ];
    }

    /**
     * Handle booking intent with smart responses.
     */
    private function handleBookingIntent($intent, Request $request)
    {
        // Manually try to authenticate from Bearer token
        $user = null;
        if ($request->bearerToken()) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
            if ($token) {
                $user = $token->tokenable;
            }
        }
        $isAuthenticated = $user !== null;
        
        // Build response based on what info we have
        $missing = [];
        if (!$intent['doctor_id']) $missing[] = 'doctor';
        if (!$intent['date']) $missing[] = 'date';
        if (!$intent['time']) $missing[] = 'time';

        // If not logged in, ask to login first
        if (!$isAuthenticated) {
            $isArabic = preg_match('/[\x{0600}-\x{06FF}]/u', $request->message);
            $reply = $isArabic
                ? "باش نحجزلك موعد، خاصك تدخل لحسابك أولاً. ⬇️"
                : "To book an appointment, you need to **log in** first. Click below to sign in! ⬇️";

            return response()->json([
                'reply' => $reply,
                'action' => 'login_required',
                'booking_data' => $intent
            ]);
        }

        // If info is missing, ask for it
        if (!empty($missing)) {
            $isArabic = preg_match('/[\x{0600}-\x{06FF}]/u', $request->message);
            
            if ($isArabic) {
                $parts = [];
                if (in_array('doctor', $missing)) $parts[] = 'شمن طبيب';
                if (in_array('date', $missing)) $parts[] = 'نهار التاريخ (مثلاً غداً)';
                if (in_array('time', $missing)) $parts[] = 'الوقت (مثلاً 11:00)';
                $reply = 'باش نكمل الحجز، عطيني: ' . implode('، ', $parts);
            } else {
                $parts = [];
                if (in_array('doctor', $missing)) $parts[] = 'which doctor';
                if (in_array('date', $missing)) $parts[] = 'what date (e.g., tomorrow)';
                if (in_array('time', $missing)) $parts[] = 'what time (e.g., 11:00 AM)';
                $reply = 'To complete the booking, I need: **' . implode(', ', $parts) . '**';
            }

            return response()->json([
                'reply' => $reply,
                'action' => 'need_info',
                'booking_data' => $intent
            ]);
        }

        // All info available — show confirmation
        $doctor = Doctor::with('user')->find($intent['doctor_id']);
        $fee = $doctor ? $doctor->consultation_fee : 0;

        $isArabic = preg_match('/[\x{0600}-\x{06FF}]/u', $request->message);
        $reply = $isArabic
            ? "✅ تأكيد الحجز:\n- **طبيب**: {$intent['doctor_name']}\n- **تاريخ**: {$intent['date']}\n- **وقت**: {$intent['time']}\n- **ثمن**: {$fee} MAD\n\nواش نأكد الحجز؟"
            : "✅ **Booking Confirmation:**\n- **Doctor**: {$intent['doctor_name']}\n- **Date**: {$intent['date']}\n- **Time**: {$intent['time']}\n- **Fee**: {$fee} MAD\n\nShall I confirm this booking?";

        return response()->json([
            'reply' => $reply,
            'action' => 'confirm_booking',
            'booking_data' => [
                'doctor_id' => $intent['doctor_id'],
                'doctor_name' => $intent['doctor_name'],
                'date' => $intent['date'],
                'time' => $intent['time'],
                'fee' => $fee
            ]
        ]);
    }

    /**
     * Confirm and create the appointment.
     */
    public function confirmBooking(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|string',
            'time' => 'required|string',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $doctor = Doctor::with('user')->findOrFail($request->doctor_id);

        $appointment = Appointment::create([
            'doctor_id' => $request->doctor_id,
            'patient_id' => $user->id,
            'appointment_date' => $request->date,
            'appointment_time' => $request->time ?: '09:00:00',
            'type' => 'consultation',
            'reason' => 'Booked via MediAI Assistant',
            'amount' => $doctor->consultation_fee ?? 0,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        $doctorName = 'Dr. ' . ($doctor->user->first_name ?? '') . ' ' . ($doctor->user->last_name ?? '');

        return response()->json([
            'success' => true,
            'message' => "Appointment booked with {$doctorName} on {$request->date} at {$request->time}!",
            'appointment' => $appointment->load(['patient', 'doctor.user'])
        ]);
    }

    /**
     * Parse natural language dates.
     */
    private function parseDate($msg)
    {
        $today = now();
        
        if (preg_match('/\b(today|aujourd\'?hui|lyoum|اليوم)\b/i', $msg)) {
            return $today->format('Y-m-d');
        }
        if (preg_match('/\b(tomorrow|demain|ghda|غداً|غدا)\b/i', $msg)) {
            return $today->addDay()->format('Y-m-d');
        }
        if (preg_match('/\b(after\s*tomorrow|après\s*demain|ba3d\s*ghda)\b/i', $msg)) {
            return $today->addDays(2)->format('Y-m-d');
        }
        // Try to match explicit dates like 2026-05-06 or 06/05/2026
        if (preg_match('/(\d{4}-\d{2}-\d{2})/', $msg, $m)) {
            return $m[1];
        }
        if (preg_match('/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/', $msg, $m)) {
            return "{$m[3]}-{$m[2]}-{$m[1]}";
        }
        
        return null;
    }

    /**
     * Parse natural language times.
     */
    private function parseTime($msg)
    {
        // Match "11 am", "2:30 pm", "14h", "à 11h", etc.
        if (preg_match('/(\d{1,2})[:\.]?(\d{2})?\s*(am|pm)/i', $msg, $m)) {
            $hour = (int)$m[1];
            $min = !empty($m[2]) ? $m[2] : '00';
            if (strtolower($m[3]) === 'pm' && $hour < 12) $hour += 12;
            if (strtolower($m[3]) === 'am' && $hour === 12) $hour = 0;
            return sprintf('%02d:%s', $hour, $min);
        }
        if (preg_match('/(\d{1,2})[h:](\d{2})?/i', $msg, $m)) {
            $hour = (int)$m[1];
            $min = !empty($m[2]) ? $m[2] : '00';
            return sprintf('%02d:%s', $hour, $min);
        }
        // Just a number like "at 11" or "à 3"
        if (preg_match('/(?:at|à|f|fi)\s+(\d{1,2})\b/i', $msg, $m)) {
            $hour = (int)$m[1];
            return sprintf('%02d:00', $hour);
        }
        
        return null;
    }
}
