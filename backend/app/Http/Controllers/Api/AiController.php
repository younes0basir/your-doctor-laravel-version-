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

        $systemPrompt = "You are 'MediAI', a brilliant and empathetic medical assistant for the 'Your Doctor' platform.
        Your goal is to help users understand their symptoms and guide them to the right medical specialty.
        
        RULES:
        1. Language: You MUST reply in the same language the user uses.
        2. Brevity: Be EXTREMELY CONCISE. Use maximum 2-3 short sentences per answer. Avoid long explanations.
        3. Disclaimer: Include a VERY SHORT disclaimer (e.g., 'AI Assistant - Not a diagnosis').
        4. Analysis: Suggest the most likely medical specialty quickly.
        5. Matching: Use ONLY these specialties: " . implode(', ', $specialties) . ".
        6. Tone: Professional and direct.
        
        If the user mentions emergency symptoms, tell them to call emergency services immediately.";

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

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post($apiUrl, [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.6,
                'top_p' => 0.7,
                'max_tokens' => 1024,
            ]);

            if ($response->successful()) {
                $aiResponse = $response->json()['choices'][0]['message']['content'];
                
                // Try to extract specialty if mentioned
                $suggestedSpecialty = null;
                foreach ($specialties as $specialty) {
                    if (stripos($aiResponse, $specialty) !== false) {
                        $suggestedSpecialty = $specialty;
                        break;
                    }
                }

                return response()->json([
                    'reply' => $aiResponse,
                    'suggested_specialty' => $suggestedSpecialty
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
