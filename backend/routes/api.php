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
    Route::put('/doctors/profile', [DoctorController::class, 'updateProfile']);
    Route::get('/doctors/stats', [DoctorController::class, 'stats']);
    Route::get('/doctors/specialities', [DoctorController::class, 'specialities']);
    Route::post('/doctors/upload-image', [DoctorController::class, 'uploadImage']);
    Route::post('/doctors/upload-logo', [DoctorController::class, 'uploadCabinetLogo']);
    Route::put('/doctors/change-password', [DoctorController::class, 'changePassword']);
    Route::get('/patients/doctor/{id}', [DoctorController::class, 'patients']);
    Route::get('/doctor/availabilities', [DoctorController::class, 'getAvailabilities']);
    Route::post('/doctor/availabilities', [DoctorController::class, 'updateAvailability']);
    Route::get('/doctor/medical-records/{patientId}', [DoctorController::class, 'medicalRecords']);
    Route::get('/doctor/profile', [DoctorController::class, 'profile']);
    
    // Users management
    Route::apiResource('users', UserController::class);
    
    // Appointments
    Route::get('/appointments/doctor/{doctorId}', [AppointmentController::class, 'doctorAppointments']);
    Route::get('/appointments/queue/{doctorId}', [AppointmentController::class, 'todayQueue']);
    Route::get('/assistants/stats', [AppointmentController::class, 'assistantStats']);
    Route::apiResource('appointments', AppointmentController::class);
    Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::patch('/appointments/{id}/queue', [AppointmentController::class, 'updateQueueStatus']);
    Route::patch('/appointments/{id}/payment-status', [AppointmentController::class, 'updatePaymentStatus']);
    Route::get('/my-appointments', [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/patient/{patientId}/history', [AppointmentController::class, 'patientHistory']);

    // Medical Records
    Route::apiResource('medical-records', \App\Http\Controllers\MedicalRecordController::class);
    Route::get('/medical-records/patient/{patientId}', [\App\Http\Controllers\MedicalRecordController::class, 'getByPatient']);
});

// Parameterized public routes (placed after static routes to avoid collisions)
Route::get('/doctors/by-user/{userId}', [DoctorController::class, 'byUser']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);
Route::get('/doctors/{doctorId}/availabilities', [DoctorController::class, 'publicAvailabilities']);
// Admin routes (Admin only)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard & Statistics
    Route::get('/dashboard', [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
    Route::get('/statistics', [\App\Http\Controllers\Api\AdminController::class, 'statistics']);
    Route::get('/permissions', [\App\Http\Controllers\Api\AdminController::class, 'getPermissions']);
    Route::get('/activity-logs', [\App\Http\Controllers\Api\AdminController::class, 'getActivityLogs']);
    
    // User Management (Full CRUD)
    Route::get('/users', [\App\Http\Controllers\Api\AdminController::class, 'accounts']);
    Route::post('/users', [\App\Http\Controllers\Api\AdminController::class, 'createUser']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteUser']);
    Route::post('/users/bulk-action', [\App\Http\Controllers\Api\AdminController::class, 'bulkUserAction']);
    
    // Doctor Management
    Route::patch('/doctors/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateDoctorStatus']);
    
    // Appointment Management
    Route::get('/appointments', [\App\Http\Controllers\Api\AdminController::class, 'appointments']);
    Route::patch('/appointments/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateAppointmentStatus']);
    Route::delete('/appointments/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteAppointment']);
});

// Admin & Assistant shared routes
Route::middleware(['auth:sanctum', 'admin.or.assistant'])->prefix('admin')->group(function () {
    // Patient Management (Shared)
    Route::get('/patients', function (Illuminate\Http\Request $request) {
        $request->merge(['role' => 'patient']);
        return (new \App\Http\Controllers\Api\AdminController)->accounts($request);
    });
    Route::post('/patients', function (Illuminate\Http\Request $request) {
        $request->merge([
            'role' => 'patient',
            'password' => $request->password ?: 'password123',
            'status' => 'active'
        ]);
        return (new \App\Http\Controllers\Api\AdminController)->createUser($request);
    });
});

// Debug catch-all for 404s
Route::fallback(function (\Illuminate\Http\Request $request) {
    return response()->json([
        'message' => 'Route not found: ' . $request->fullUrl(),
        'method' => $request->method(),
        'path' => $request->path()
    ], 404);
});
