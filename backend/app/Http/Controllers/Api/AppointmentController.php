<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments.
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor.user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->orderBy('appointment_date', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($appointments);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
            'type' => 'required|in:consultation,follow-up,emergency',
            'reason' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $appointment = Appointment::create([
            'patient_id' => $request->user()->id,
            'doctor_id' => $request->doctor_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'type' => $request->type,
            'reason' => $request->reason,
            'notes' => $request->notes,
            'amount' => $request->amount,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Appointment booked successfully',
            'appointment' => $appointment->load(['patient', 'doctor.user']),
        ], 201);
    }

    /**
     * Display the specified appointment.
     */
    public function show(string $id)
    {
        $appointment = Appointment::with(['patient', 'doctor.user'])->findOrFail($id);
        
        return response()->json($appointment);
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);

        $appointment->update($request->all());

        return response()->json([
            'message' => 'Appointment updated successfully',
            'appointment' => $appointment->load(['patient', 'doctor.user']),
        ]);
    }

    /**
     * Update appointment status.
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status updated successfully',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Remove the specified appointment.
     */
    public function destroy(string $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment cancelled successfully',
        ]);
    }

    /**
     * Get current user's appointments.
     */
    public function myAppointments(Request $request)
    {
        $appointments = Appointment::with(['doctor.user'])
            ->where('patient_id', $request->user()->id)
            ->orderBy('appointment_date', 'desc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Get appointments for a specific doctor.
     */
    public function doctorAppointments(string $doctorId)
    {
        // First, check if the provided ID is already a Doctor Profile ID
        $doctorProfile = Doctor::find($doctorId);
        
        // If not found by ID, it might be a User ID (fallback for older frontend code or specific views)
        if (!$doctorProfile) {
            $doctorProfile = Doctor::where('user_id', $doctorId)->first();
        }

        if (!$doctorProfile) {
            return response()->json([], 200); // No profile, no appointments
        }

        $realDoctorId = $doctorProfile->id;

        $appointments = Appointment::with(['patient', 'doctor.user'])
            ->where('doctor_id', $realDoctorId)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Update queue status (waiting room).
     */
    public function updateQueueStatus(Request $request, string $id)
    {
        $request->validate([
            'queue_status' => 'required|in:waiting,in_consultation,finished',
        ]);

        $appointment = Appointment::findOrFail($id);
        
        $updateData = ['queue_status' => $request->queue_status];
        
        if ($request->queue_status === 'waiting' && !$appointment->arrival_time) {
            $updateData['arrival_time'] = now();
            // Automatically confirm if they just showed up pending
            if ($appointment->status === 'pending') {
                $updateData['status'] = 'confirmed'; 
            }
        } elseif ($request->queue_status === 'in_consultation' && !$appointment->consultation_start_time) {
            $updateData['consultation_start_time'] = now();
        } elseif ($request->queue_status === 'finished') {
            $updateData['status'] = 'completed';
        }

        $appointment->update($updateData);

        return response()->json([
            'message' => 'Queue status updated successfully',
            'appointment' => $appointment->fresh()->load(['patient', 'doctor.user']),
        ]);
    }

    /**
     * Get today's queue for a doctor.
     */
    public function todayQueue(Request $request, string $doctorId)
    {
        // Handle User ID passed instead of Doctor Profile ID
        $doctorProfile = \App\Models\Doctor::where('user_id', $doctorId)->first();
        $realDoctorId = $doctorProfile ? $doctorProfile->id : $doctorId;

        // SQLite doesn't have FIELD(), so we order by queue_status directly or handle it in collection
        // Usually, we just want 'in_consultation' at the top, then 'waiting' ordered by arrival_time
        $appointments = Appointment::with(['patient', 'doctor.user'])
            ->where('doctor_id', $realDoctorId)
            ->whereDate('appointment_date', now()->toDateString())
            ->whereNotNull('queue_status')
            ->whereIn('queue_status', ['waiting', 'in_consultation'])
            ->get();
            
        // Sort: in_consultation first, then waiting ordered by arrival_time
        $sorted = $appointments->sortBy(function($app) {
            $rank = $app->queue_status === 'in_consultation' ? 1 : 2;
            return $rank . '-' . $app->arrival_time;
        })->values();

        return response()->json($sorted);
    }

    /**
     * Get statistics for assistant dashboard.
     */
    public function assistantStats(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'assistant' || !$user->doctor_id) {
            return response()->json(['error' => 'Unauthorized or no doctor assigned'], 403);
        }

        // Get doctor profile ID from user ID
        $doctorProfile = \App\Models\Doctor::where('user_id', $user->doctor_id)->first();
        if (!$doctorProfile) {
            return response()->json(['error' => 'Doctor profile not found'], 404);
        }
        $doctorProfileId = $doctorProfile->id;

        $todayAppointments = Appointment::where('doctor_id', $doctorProfileId)
            ->whereDate('appointment_date', now()->toDateString())
            ->count();

        $totalPatients = Appointment::where('doctor_id', $doctorProfileId)
            ->distinct('patient_id')
            ->count('patient_id');

        $pendingAppointments = Appointment::where('doctor_id', $doctorProfileId)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'appointments' => $todayAppointments,
            'patients' => $totalPatients,
            'pending' => $pendingAppointments,
        ]);
    }

    /**
     * Update payment status of an appointment.
     */
    public function updatePaymentStatus(Request $request, string $id)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,refunded,failed',
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->update(['payment_status' => $request->payment_status]);

        return response()->json([
            'message' => 'Payment status updated successfully',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Get appointment history for a specific patient.
     */
    public function patientHistory(Request $request, string $patientId)
    {
        $appointments = Appointment::with(['doctor.user'])
            ->where('patient_id', $patientId)
            ->orderBy('appointment_date', 'desc')
            ->get();

        return response()->json($appointments);
    }
}
