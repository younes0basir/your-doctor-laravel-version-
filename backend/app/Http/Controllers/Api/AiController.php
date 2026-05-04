<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Doctor;

class AiController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array'
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
            $specialties = ['Generalist']; // Fallback
        }
        
        // Language detection (Simple Arabic check)
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

        $startTime = microtime(true);
        try {
            $response = Http::timeout(30)
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
                'max_tokens' => 256,
            ]);

            $aiTime = microtime(true) - $startTime;
            \Log::info("AI Response Time: " . $aiTime . "s");

            if ($response->successful()) {
                $aiResponse = $response->json()['choices'][0]['message']['content'];
                
                $dbStartTime = microtime(true);
                // Try to extract specialty if mentioned
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
                        ->where('specialty', $suggestedSpecialty) // Corrected column name
                        ->where('status', 'approved')
                        ->limit(3)
                        ->get()
                        ->map(function($doctor) {
                            return [
                                'id' => $doctor->id,
                                'name' => 'Dr. ' . ($doctor->user->first_name ?? '') . ' ' . ($doctor->user->last_name ?? ''),
                                'specialty' => $doctor->specialty, // Corrected column name
                                'image' => $doctor->profile_picture, // Corrected column name
                                'experience' => $doctor->experience_years . ' years', // Corrected column name
                                'fee' => $doctor->consultation_fee // Corrected column name
                            ];
                        });
                }
                $dbTime = microtime(true) - $dbStartTime;
                \Log::info("DB Query Time: " . $dbTime . "s");

                return response()->json([
                    'reply' => $aiResponse,
                    'suggested_specialty' => $suggestedSpecialty,
                    'recommended_doctors' => $recommendedDoctors
                ]);
            }

            return response()->json([
                'error' => 'AI Service temporarily unavailable',
                'details' => $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while connecting to AI',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
