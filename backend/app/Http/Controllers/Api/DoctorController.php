<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Appointment;
use App\Models\DoctorAvailability;
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

    /**
     * Get the authenticated doctor's profile.
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized. Role is ' . $user->role], 403);
        }

        $doctor = Doctor::with('user')->where('user_id', $user->id)->first();
        
        if (!$doctor) {
            return response()->json([
                'message' => 'Doctor profile not found for user ID ' . $user->id,
                'user' => $user
            ], 404);
        }

        return response()->json($doctor);
    }

    /**
     * Get doctor profile by user ID.
     */
    public function byUser(string $userId)
    {
        $doctor = Doctor::with('user', 'reviews.patient')->where('user_id', $userId)->first();
        
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        return response()->json([
            'doctor' => $doctor,
            'average_rating' => $doctor->averageRating(),
        ]);
    }

    /**
     * Get statistics for the authenticated doctor.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized. Role is ' . $user->role], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->first();
        
        if (!$doctor) {
            return response()->json([
                'message' => 'Doctor profile not found for user ID ' . $user->id,
                'user' => $user
            ], 404);
        }
        
        $today = now()->startOfDay();
        $weekStart = now()->startOfWeek();

        $appointments = Appointment::where('doctor_id', $doctor->id)->get();
        
        $todayCount = $appointments->filter(fn($a) => \Carbon\Carbon::parse($a->appointment_date)->isToday())->count();
        $weekCount = $appointments->filter(fn($a) => \Carbon\Carbon::parse($a->appointment_date)->isAfter($weekStart))->count();
        $totalPatients = $appointments->pluck('patient_id')->unique()->count();
        
        $pending = $appointments->where('status', 'pending')->count();
        $completed = $appointments->where('status', 'completed')->count();

        return response()->json([
            'appointments' => [
                'today' => $todayCount,
                'week' => $weekCount,
                'change' => 0 // Placeholder
            ],
            'patients' => [
                'total' => $totalPatients,
                'new' => 0 // Placeholder
            ],
            'tasks' => [
                'pending' => $pending,
                'completed' => $completed
            ]
        ]);
    }

    /**
     * Get unique patients for a specific doctor.
     */
    public function patients(string $id)
    {
        // Resolve: try User ID first (for assistant), then Profile ID (for doctor)
        $doctor = Doctor::where('user_id', $id)->first();
        if (!$doctor) {
            $doctor = Doctor::findOrFail($id);
        }
        $doctorProfileId = $doctor->id;
        $doctorUserId = $doctor->user_id;

        $patients = User::where('role', 'patient')
        ->where(function($q) use ($doctorProfileId, $doctorUserId) {
            $q->whereHas('appointments', function ($query) use ($doctorProfileId) {
                $query->where('doctor_id', $doctorProfileId);
            })
            ->orWhere('doctor_id', $doctorUserId);
        })
        ->get();

        return response()->json($patients);
    }

    /**
     * Update doctor profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        // Update User
        $user->update([
            'first_name' => $request->firstName ?? $user->first_name,
            'last_name' => $request->lastName ?? $user->last_name,
            'address' => $request->address ?? $user->address,
            'image' => $request->image_url ?? $user->image,
        ]);

        // Update Doctor
        $doctor->update([
            'about' => $request->specialty_description ?? $doctor->about,
            'consultation_fee' => $request->consultation_fee ?? $doctor->consultation_fee,
            'experience_years' => $request->experience_years ?? $doctor->experience_years,
            'education' => $request->degree ?? $doctor->education,
            // 'city' is not on user/doctor models directly, could be added to address
        ]);

        // Attach updated user to doctor to return in the same format
        $doctor->user = $user;
        // Map frontend fields back
        $doctor->firstName = $user->first_name;
        $doctor->lastName = $user->last_name;
        $doctor->email = $user->email;
        $doctor->image_url = $user->image;
        $doctor->address = $user->address;
        $doctor->specialty_description = $doctor->about;
        $doctor->degree = $doctor->education;

        return response()->json($doctor);
    }

    /**
     * Upload doctor profile image.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        // Upload to Cloudinary
        $result = $request->file('image')->storeOnCloudinary('doctor_profiles');
        $imageUrl = $result->getSecurePath();

        // Update both User image and Doctor profile_picture
        $user->update(['image' => $imageUrl]);
        $doctor->update(['profile_picture' => $imageUrl]);

        return response()->json(['image_url' => $imageUrl]);
    }

    /**
     * Upload cabinet logo.
     */
    public function uploadCabinetLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:5120',
        ]);

        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        // Upload to Cloudinary
        $result = $request->file('logo')->storeOnCloudinary('cabinet_logos');
        $logoUrl = $result->getSecurePath();

        $doctor->update(['cabinet_logo' => $logoUrl]);

        return response()->json(['logo_url' => $logoUrl]);
    }

    /**
     * Change doctor password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'currentPassword' => 'required',
            'newPassword' => 'required|min:6',
        ]);

        $user = $request->user();

        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->update(['password' => Hash::make($request->newPassword)]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Get specialities.
     */
    public function specialities()
    {
        // Static list for now to satisfy the frontend requirement
        $specialities = [
            ['id' => 1, 'name' => 'Cardiology'],
            ['id' => 2, 'name' => 'Dermatology'],
            ['id' => 3, 'name' => 'Neurology'],
            ['id' => 4, 'name' => 'Pediatrics'],
            ['id' => 5, 'name' => 'Psychiatry'],
            ['id' => 6, 'name' => 'General Practice'],
        ];

        return response()->json($specialities);
    }
    /**
     * Get doctor availabilities for calendar.
     */
    public function getAvailabilities(Request $request)
    {
        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $availabilities = $doctor->availabilities()
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($availabilities);
    }

    /**
     * Toggle availability for a specific date.
     */
    public function updateAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'is_available' => 'required|boolean',
            'reason' => 'nullable|string|max:255',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
        ]);

        $user = $request->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $availability = DoctorAvailability::updateOrCreate(
            [
                'doctor_id' => $doctor->id,
                'date' => $request->date,
            ],
            [
                'is_available' => $request->is_available,
                'reason' => $request->reason,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
            ]
        );

        return response()->json([
            'message' => 'Availability updated successfully',
            'availability' => $availability
        ]);
    }

    /**
     * Get availabilities for a specific doctor (public).
     */
    public function publicAvailabilities(string $doctorId)
    {
        $availabilities = DoctorAvailability::where('doctor_id', $doctorId)
            ->where('is_available', false) // We only care about blocked slots for now
            ->get();

        return response()->json($availabilities);
    }

    /**
     * Proxy search for medicines to avoid CORS issues in frontend.
     */
    public function searchMedicines(Request $request)
    {
        $query = $request->query('q');
        $limit = $request->query('limit', 15);

        if (!$query || strlen($query) < 2) {
            return response()->json(['items' => []]);
        }

        try {
            // We search by Name and DCI (Ingredient) in parallel (simulated here)
            $baseUrl = 'https://medicament-api.vercel.app/api/medicaments';
            
            $responseName = \Illuminate\Support\Facades\Http::get($baseUrl, [
                'nom' => $query,
                'limit' => $limit
            ]);

            $responseDci = \Illuminate\Support\Facades\Http::get($baseUrl, [
                'dci1' => $query,
                'limit' => $limit
            ]);

            $nameItems = $responseName->json()['items'] ?? [];
            $dciItems = $responseDci->json()['items'] ?? [];

            // Merge and remove duplicates
            $combined = array_merge($nameItems, $dciItems);
            $unique = collect($combined)->unique('id')->values()->take(20);

            return response()->json(['items' => $unique]);
        } catch (\Exception $e) {
            \Log::error("Medicine search failed: " . $e->getMessage());
            return response()->json(['items' => [], 'error' => 'API Unavailable'], 503);
        }
    }

    public function getMedicineById(string $id)
    {
        try {
            $response = \Illuminate\Support\Facades\Http::get("https://medicament-api.vercel.app/api/medicaments/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'API Unavailable'], 503);
        }
    }
}
