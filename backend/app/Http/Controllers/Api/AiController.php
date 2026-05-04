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

        // Fetch specialties for context
        $specialties = [
            'Generalist', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 
            'Orthopedics', 'Psychiatry', 'Gynecology', 'Ophthalmology', 'Urology',
            'Gastroenterology', 'Endocrinology'
        ];

        $systemPrompt = "You are 'MediAI', a brilliant and empathetic medical assistant for 'Your Doctor'.
        Your goal is to help users understand their symptoms and guide them to the right medical specialty.
        
        SYMPTOM GUIDANCE:
        - 'Rasi' = Head (Suggest Generalist or Neurology)
        - 'Skhana' = Fever (Suggest Generalist or Pediatrics)
        - 'Kerchi' = Stomach (Suggest Gastroenterology)
        - 'Sadri' = Chest (Suggest Cardiology)
        - 'Dahri' = Back (Suggest Orthopedics)
        
        RULES:
        1. Language: Reply in the EXACT same language/dialect as the user (English, French, Arabic, or Darija).
        2. Accuracy: Analyze symptoms carefully. Do NOT hallucinate symptoms the user didn't mention.
        3. Brevity: Be concise (2-3 sentences).
        4. Disclaimer: Include 'AI Assistant - Not a diagnosis'.
        5. Matching: Use ONLY these specialties: " . implode(', ', $specialties) . ".
        ";

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        // Add history if exists
        if ($request->history) {
            foreach ($request->history as $msg) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content']
                ];
            }
        }

        // Add current message
        $messages[] = ['role' => 'user', 'content' => $request->message];

        $startTime = microtime(true);
        try {
            $response = Http::timeout(60)
                ->withOptions(['verify' => false])
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])->post($apiUrl, [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.5,
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
                    // Check if specialty is mentioned as a whole word (case insensitive)
                    if (preg_match('/\b' . preg_quote($specialty, '/') . '\b/i', $aiResponse)) {
                        $suggestedSpecialty = $specialty;
                        break;
                    }
                }

                $recommendedDoctors = [];
                if ($suggestedSpecialty) {
                    $recommendedDoctors = Doctor::with('user')
                        ->where('speciality', $suggestedSpecialty)
                        ->where('status', 'approved')
                        ->limit(3)
                        ->get()
                        ->map(function($doctor) {
                            return [
                                'id' => $doctor->id,
                                'name' => 'Dr. ' . ($doctor->user->first_name ?? '') . ' ' . ($doctor->user->last_name ?? ''),
                                'specialty' => $doctor->speciality,
                                'image' => $doctor->image,
                                'experience' => $doctor->experience,
                                'fee' => $doctor->fees
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
