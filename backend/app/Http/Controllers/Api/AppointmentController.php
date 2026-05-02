<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
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
        $appointments = Appointment::with(['patient', 'doctor.user'])
            ->where('doctor_id', $doctorId)
            ->orderBy('appointment_date', 'desc')
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
        // SQLite doesn't have FIELD(), so we order by queue_status directly or handle it in collection
        // Usually, we just want 'in_consultation' at the top, then 'waiting' ordered by arrival_time
        $appointments = Appointment::with(['patient', 'doctor.user'])
            ->where('doctor_id', $doctorId)
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
}
