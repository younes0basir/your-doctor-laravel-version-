<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function dashboard()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        $stats = [
            'total_users' => User::count(),
            'total_patients' => User::where('role', 'patient')->count(),
            'total_doctors' => User::where('role', 'doctor')->count(),
            'active_doctors' => Doctor::where('status', 'approved')->count(),
            'total_appointments' => Appointment::count(),
            'today_appointments' => Appointment::whereDate('appointment_date', $today)->count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'monthly_revenue' => Appointment::where('payment_status', 'paid')
                ->whereMonth('created_at', Carbon::now()->month)
                ->sum('amount'),
        ];

        return response()->json([
            'statistics' => $stats,
        ]);
    }

    /**
     * Get all accounts with filtering.
     */
    public function accounts(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cin', 'like', "%{$search}%");
            });
        }

        $accounts = $query->with('doctorProfile')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($accounts);
    }

    /**
     * Get all appointments with filtering.
     */
    public function appointments(Request $request)
    {
        $query = Appointment::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('appointment_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('appointment_date', '<=', $request->date_to);
        }

        $appointments = $query->with(['patient', 'doctor.user'])
            ->orderBy('appointment_date', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($appointments);
    }

    /**
     * Get detailed statistics for charts.
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $startDate = Carbon::now()->subDays($period);

        // Appointments trend - Cross-DB compatible
        $isPostgres = DB::getDriverName() === 'pgsql';
        $dateFormat = $isPostgres ? "TO_CHAR(appointment_date, 'YYYY-MM-DD')" : "strftime('%Y-%m-%d', appointment_date)";
        $createdFormat = $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM-DD')" : "strftime('%Y-%m-%d', created_at)";
        $monthFormat = $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM')" : "strftime('%Y-%m', created_at)";

        $appointmentsTrend = Appointment::select(
                DB::raw("$dateFormat as date"),
                DB::raw('COUNT(*) as count'),
                DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed")
            )
            ->where('appointment_date', '>=', $startDate->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // User growth
        $userGrowth = User::select(
                DB::raw("$createdFormat as date"),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Appointment types distribution
        $appointmentTypes = Appointment::select('type', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('type')
            ->get();

        // Monthly revenue
        $revenue = Appointment::select(
                DB::raw("$monthFormat as month"),
                DB::raw('SUM(amount) as revenue')
            )
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'appointments_trend' => $appointmentsTrend,
            'user_growth' => $userGrowth,
            'appointment_types' => $appointmentTypes,
            'revenue' => $revenue,
        ]);
    }

    /**
     * Create a new user (admin, patient, doctor, or assistant).
     */
    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,patient,doctor,assistant',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,pending,approved,hidden',
            'doctor_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'status' => $request->status ?? 'active',
            'doctor_id' => $request->doctor_id,
        ]);

        // If creating a doctor, create doctor profile
        if ($request->role === 'doctor' && $request->has('specialty')) {
            Doctor::create([
                'user_id' => $user->id,
                'specialty' => $request->specialty,
                'experience' => $request->experience ?? '',
                'status' => 'pending',
                'fees' => $request->fees ?? 0,
            ]);
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('doctorProfile')
        ], 201);
    }

    /**
     * Update user details.
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|in:active,inactive,pending,approved,hidden',
            'role' => 'sometimes|in:admin,patient,doctor,assistant',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = $request->only(['first_name', 'last_name', 'email', 'phone', 'status', 'role']);
        
        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh()->load('doctorProfile')
        ]);
    }

    /**
     * Delete a user.
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        // Delete associated doctor profile if exists
        if ($user->doctorProfile) {
            $user->doctorProfile->delete();
        }

        // Delete associated appointments
        Appointment::where('patient_id', $id)->delete();
        Appointment::where('doctor_id', $id)->delete();

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Update doctor status.
     */
    public function updateDoctorStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,hidden,rejected',
        ]);

        $doctor = Doctor::where('user_id', $id)->firstOrFail();
        $doctor->update(['status' => $request->status]);

        // If approved, also update user status
        if ($request->status === 'approved') {
            $user = User::findOrFail($id);
            $user->update(['status' => 'active']);
        }

        return response()->json([
            'message' => 'Doctor status updated successfully',
            'doctor' => $doctor->fresh()
        ]);
    }

    /**
     * Update appointment status.
     */
    public function updateAppointmentStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,in_progress,completed,canceled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Appointment status updated',
            'appointment' => $appointment->fresh()->load(['patient', 'doctor.user'])
        ]);
    }

    /**
     * Delete an appointment.
     */
    public function deleteAppointment($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully']);
    }

    /**
     * Get system activity logs.
     */
    public function getActivityLogs(Request $request)
    {
        // This would typically query an activity_logs table
        // For now, return recent appointments and user creations
        $recentAppointments = Appointment::with(['patient', 'doctor.user'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'recent_appointments' => $recentAppointments,
            'recent_users' => $recentUsers,
        ]);
    }

    /**
     * Get admin permissions/roles.
     */
    public function getPermissions()
    {
        return response()->json([
            'permissions' => [
                'users' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true,
                ],
                'doctors' => [
                    'view' => true,
                    'approve' => true,
                    'reject' => true,
                    'edit' => true,
                ],
                'appointments' => [
                    'view' => true,
                    'edit' => true,
                    'delete' => true,
                    'cancel' => true,
                ],
                'assistants' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true,
                ],
                'statistics' => [
                    'view' => true,
                    'export' => true,
                ],
                'settings' => [
                    'view' => true,
                    'edit' => true,
                ],
            ]
        ]);
    }

    /**
     * Bulk actions for users.
     */
    public function bulkUserAction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:activate,deactivate,delete',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userIds = $request->user_ids;
        $action = $request->action;

        // Prevent deleting current admin
        $userIds = array_filter($userIds, function($id) {
            return $id != auth()->id();
        });

        switch ($action) {
            case 'activate':
                User::whereIn('id', $userIds)->update(['status' => 'active']);
                $message = 'Users activated successfully';
                break;
            case 'deactivate':
                User::whereIn('id', $userIds)->update(['status' => 'inactive']);
                $message = 'Users deactivated successfully';
                break;
            case 'delete':
                User::whereIn('id', $userIds)->each(function($user) {
                    if ($user->doctorProfile) {
                        $user->doctorProfile->delete();
                    }
                    Appointment::where('patient_id', $user->id)->delete();
                    Appointment::where('doctor_id', $user->id)->delete();
                    $user->delete();
                });
                $message = 'Users deleted successfully';
                break;
        }

        return response()->json(['message' => $message]);
    }
}
