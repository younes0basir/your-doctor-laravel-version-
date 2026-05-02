<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint (public)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => config('app.name'),
        'environment' => config('app.env'),
        'database' => [
            'connection' => config('database.default'),
            'status' => 'connected'
        ]
    ], 200);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes - No authentication required
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/specialty/{specialty}', [DoctorController::class, 'bySpecialty']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Doctor specific protected routes
    Route::get('/doctors/profile', [DoctorController::class, 'profile']);
    Route::get('/doctors/stats', [DoctorController::class, 'stats']);
    Route::get('/patients/doctor/{id}', [DoctorController::class, 'patients']);
    
    // Users management
    Route::apiResource('users', UserController::class);
    
    // Appointments
    Route::get('/appointments/doctor/{doctorId}', [AppointmentController::class, 'doctorAppointments']);
    Route::apiResource('appointments', AppointmentController::class);
    Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::get('/my-appointments', [AppointmentController::class, 'myAppointments']);
});

// Parameterized public routes (placed after static routes to avoid collisions)
Route::get('/doctors/{id}', [DoctorController::class, 'show']);

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard & Statistics
    Route::get('/dashboard', [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
    Route::get('/statistics', [\App\Http\Controllers\Api\AdminController::class, 'statistics']);
    Route::get('/permissions', [\App\Http\Controllers\Api\AdminController::class, 'getPermissions']);
    Route::get('/activity-logs', [\App\Http\Controllers\Api\AdminController::class, 'getActivityLogs']);
    
    // User Management (Full CRUD)
    Route::get('/accounts', [\App\Http\Controllers\Api\AdminController::class, 'accounts']);
    Route::post('/accounts', [\App\Http\Controllers\Api\AdminController::class, 'createUser']);
    Route::put('/accounts/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateUser']);
    Route::delete('/accounts/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteUser']);
    Route::post('/accounts/bulk-action', [\App\Http\Controllers\Api\AdminController::class, 'bulkUserAction']);
    
    // Doctor Management
    Route::put('/doctors/{id}/approve', [\App\Http\Controllers\Api\AdminController::class, 'approveDoctor']);
    Route::put('/doctors/{id}/hide', [\App\Http\Controllers\Api\AdminController::class, 'hideDoctor']);
    
    // Appointment Management
    Route::get('/appointments', [\App\Http\Controllers\Api\AdminController::class, 'appointments']);
    Route::put('/appointments/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updateAppointmentStatus']);
    Route::delete('/appointments/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteAppointment']);
});

// Debug catch-all for 404s
Route::fallback(function (\Illuminate\Http\Request $request) {
    return response()->json([
        'message' => 'Route not found: ' . $request->fullUrl(),
        'method' => $request->method(),
        'path' => $request->path()
    ], 404);
});
