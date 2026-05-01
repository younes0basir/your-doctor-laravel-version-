<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ApiDocsController extends Controller
{
    public function index()
    {
        $routes = [];
        
        // Get all API routes
        $allRoutes = Route::getRoutes()->getRoutes();
        
        foreach ($allRoutes as $route) {
            $uri = $route->uri();
            
            // Only include API routes
            if (strpos($uri, 'api/') === 0) {
                $methods = array_filter($route->methods(), function($m) {
                    return $m !== 'OPTIONS';
                });
                
                if (empty($methods)) {
                    continue;
                }
                
                $action = $route->getActionName();
                
                $routes[] = [
                    'method' => implode('|', $methods),
                    'uri' => '/' . $uri,
                    'action' => $action,
                    'name' => $route->getName(),
                    'middleware' => $route->middleware(),
                ];
            }
        }
        
        // Sort by URI
        usort($routes, function($a, $b) {
            return strcmp($a['uri'], $b['uri']);
        });
        
        // Get live database statistics
        try {
            $stats = [
                'total_users' => User::count(),
                'total_doctors' => Doctor::count(),
                'total_appointments' => Appointment::count(),
                'total_patients' => User::where('role', 'patient')->count(),
                'total_admins' => User::where('role', 'admin')->count(),
            ];
            
            // Get sample doctors
            $sampleDoctors = Doctor::with('user')
                ->where('status', 'approved')
                ->limit(3)
                ->get()
                ->map(function($doctor) {
                    return [
                        'id' => $doctor->id,
                        'name' => $doctor->user->full_name ?? 'N/A',
                        'specialty' => $doctor->specialty,
                        'fee' => $doctor->consultation_fee,
                        'experience' => $doctor->experience_years,
                    ];
                });
            
            // Get recent appointments
            $recentAppointments = Appointment::with(['patient', 'doctor.user'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($appointment) {
                    return [
                        'id' => $appointment->id,
                        'patient' => $appointment->patient->full_name ?? 'N/A',
                        'doctor' => $appointment->doctor->user->full_name ?? 'N/A',
                        'date' => $appointment->appointment_date,
                        'time' => $appointment->appointment_time,
                        'status' => $appointment->status,
                    ];
                });
                
        } catch (\Exception $e) {
            $stats = [
                'total_users' => 0,
                'total_doctors' => 0,
                'total_appointments' => 0,
                'total_patients' => 0,
                'total_admins' => 0,
            ];
            $sampleDoctors = collect();
            $recentAppointments = collect();
        }
        
        // Database connection info
        $dbConnection = config('database.default');
        $dbStatus = 'connected';
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbStatus = 'disconnected';
        }
        
        return view('api-docs', compact(
            'routes', 
            'stats', 
            'sampleDoctors', 
            'recentAppointments',
            'dbConnection',
            'dbStatus'
        ));
    }
    
    /**
     * Test an API endpoint and return live data
     */
    public function testEndpoint(Request $request)
    {
        $uri = $request->input('uri');
        $method = $request->input('method', 'GET');
        
        try {
            // Build the full URL
            $url = url($uri);
            
            // Make internal request to get the response
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->$method($url);
            
            return response()->json([
                'success' => true,
                'status' => $response->status(),
                'data' => $response->json(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to fetch data from endpoint',
            ], 500);
        }
    }
}
