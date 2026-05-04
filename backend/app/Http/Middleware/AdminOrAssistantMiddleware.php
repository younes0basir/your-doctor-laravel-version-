<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrAssistantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !($user->isAdmin() || $user->role === 'assistant')) {
            return response()->json([
                'message' => 'Unauthorized. Admin or Assistant access required.',
            ], 403);
        }

        return $next($request);
    }
}
