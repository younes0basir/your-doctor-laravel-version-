<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [\App\Http\Controllers\ApiDocsController::class, 'index'])->name('home');
Route::post('/api/test', [\App\Http\Controllers\ApiDocsController::class, 'testEndpoint'])->name('api.test');

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'database' => \Illuminate\Support\Facades\DB::connection()->getPdo() ? 'connected' : 'disconnected',
        'timestamp' => now()->toIso8601String()
    ]);
});

// API Documentation Page
Route::get('/api-docs', [\App\Http\Controllers\ApiDocsController::class, 'index'])->name('api-docs');
