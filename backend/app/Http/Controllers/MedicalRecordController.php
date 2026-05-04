<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MedicalRecord::with(['patient', 'doctor.user', 'appointment']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'notes' => 'nullable|string',
            'vitals' => 'nullable|array',
        ]);

        \Log::info("Saving Medical Record:", $validated);
        $record = MedicalRecord::create($validated);

        // If it's linked to an appointment, mark appointment as completed? 
        // Or just keep the link.
        
        return response()->json($record->load(['patient', 'doctor.user', 'appointment']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $record = MedicalRecord::with(['patient', 'doctor.user', 'appointment'])->findOrFail($id);
        return response()->json($record);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $record = MedicalRecord::findOrFail($id);
        
        $validated = $request->validate([
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'notes' => 'nullable|string',
            'vitals' => 'nullable|array',
        ]);

        $record->update($validated);

        return response()->json($record->load(['patient', 'doctor.user', 'appointment']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $record = MedicalRecord::findOrFail($id);
        $record->delete();

        return response()->json(['message' => 'Medical record deleted successfully']);
    }

    /**
     * Get medical records for a specific patient.
     */
    public function getByPatient($patientId)
    {
        $records = MedicalRecord::with(['doctor.user', 'appointment'])
            ->where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($records);
    }
}
