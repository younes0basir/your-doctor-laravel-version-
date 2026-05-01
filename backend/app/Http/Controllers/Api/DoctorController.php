<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DoctorController extends Controller
{
    /**
     * Display a listing of doctors.
     */
    public function index(Request $request)
    {
        $query = Doctor::with('user');

        // Only show approved doctors for public access
        try {
            $user = auth('sanctum')->user();
            if (!$user || !$user->isAdmin()) {
                $query->where('status', 'approved');
            }
        } catch (\Exception $e) {
            // If auth fails, show only approved doctors
            $query->where('status', 'approved');
        }

        if ($request->has('specialty')) {
            $query->where('specialty', $request->specialty);
        }

        try {
            $user = auth('sanctum')->user();
            if ($request->has('status') && $user && $user->isAdmin()) {
                $query->where('status', $request->status);
            }
        } catch (\Exception $e) {
            // Ignore status filter if auth fails
        }

        $doctors = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($doctors);
    }

    /**
     * Store a newly created doctor.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
            'specialty' => 'required|string|max:255',
            'license_number' => 'required|string|unique:doctors',
            'consultation_fee' => 'required|numeric|min:0',
        ]);

        // Create user
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'doctor',
            'status' => 'active',
        ]);

        // Create doctor profile
        $doctor = Doctor::create([
            'user_id' => $user->id,
            'specialty' => $request->specialty,
            'license_number' => $request->license_number,
            'education' => $request->education,
            'experience_years' => $request->experience_years ?? 0,
            'consultation_fee' => $request->consultation_fee,
            'about' => $request->about,
            'available_days' => $request->available_days ?? [],
            'available_time_start' => $request->available_time_start,
            'available_time_end' => $request->available_time_end,
            'status' => 'approved',
        ]);

        return response()->json([
            'message' => 'Doctor created successfully',
            'doctor' => $doctor->load('user'),
        ], 201);
    }

    /**
     * Display the specified doctor.
     */
    public function show(string $id)
    {
        $doctor = Doctor::with('user', 'reviews.patient')->findOrFail($id);
        
        return response()->json([
            'doctor' => $doctor,
            'average_rating' => $doctor->averageRating(),
        ]);
    }

    /**
     * Update the specified doctor.
     */
    public function update(Request $request, string $id)
    {
        $doctor = Doctor::findOrFail($id);

        $request->validate([
            'specialty' => 'sometimes|string|max:255',
            'license_number' => 'sometimes|string|unique:doctors,license_number,' . $id,
            'consultation_fee' => 'sometimes|numeric|min:0',
            'status' => 'in:pending,approved,rejected',
        ]);

        $doctor->update($request->all());

        return response()->json([
            'message' => 'Doctor updated successfully',
            'doctor' => $doctor->load('user'),
        ]);
    }

    /**
     * Remove the specified doctor.
     */
    public function destroy(string $id)
    {
        $doctor = Doctor::findOrFail($id);
        $userId = $doctor->user_id;
        
        $doctor->delete();
        User::destroy($userId);

        return response()->json([
            'message' => 'Doctor deleted successfully',
        ]);
    }

    /**
     * Get doctors by specialty.
     */
    public function bySpecialty(string $specialty)
    {
        $doctors = Doctor::with('user')
            ->where('specialty', $specialty)
            ->where('status', 'approved')
            ->get();

        return response()->json($doctors);
    }
}
