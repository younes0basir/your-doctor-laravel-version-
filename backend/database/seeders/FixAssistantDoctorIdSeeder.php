<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use Illuminate\Database\Seeder;

class FixAssistantDoctorIdSeeder extends Seeder
{
    /**
     * Fix ALL assistants whose doctor_id is NULL or incorrectly set.
     */
    public function run(): void
    {
        $fixed = 0;

        // --- PART 1: Fix assistants with WRONG doctor_id (pointing to doctors profile ID) ---
        $wrongIdAssistants = User::where('role', 'assistant')
            ->whereNotNull('doctor_id')
            ->get();

        foreach ($wrongIdAssistants as $assistant) {
            $doctorId = $assistant->doctor_id;

            $validDoctorUser = User::where('id', $doctorId)
                ->where('role', 'doctor')
                ->exists();

            if (!$validDoctorUser) {
                $doctorProfile = Doctor::find($doctorId);
                if ($doctorProfile) {
                    $assistant->update(['doctor_id' => $doctorProfile->user_id]);
                    $this->command->info("Fixed assistant {$assistant->email}: doctor_id {$doctorId} -> {$doctorProfile->user_id}");
                    $fixed++;
                }
            }
        }

        // --- PART 2: Fix assistants with NULL doctor_id ---
        $nullAssistants = User::where('role', 'assistant')
            ->whereNull('doctor_id')
            ->get();

        foreach ($nullAssistants as $assistant) {
            // If there's only one doctor in the system, assign to them
            $doctorUsers = User::where('role', 'doctor')->get();

            if ($doctorUsers->count() === 1) {
                $assistant->update(['doctor_id' => $doctorUsers->first()->id]);
                $this->command->info("Auto-assigned assistant {$assistant->email} to only doctor (User ID: {$doctorUsers->first()->id})");
                $fixed++;
            } else {
                // Try to find the first approved doctor and assign
                $firstDoctor = User::where('role', 'doctor')
                    ->whereHas('doctorProfile', fn($q) => $q->where('status', 'approved'))
                    ->first();

                if ($firstDoctor) {
                    $assistant->update(['doctor_id' => $firstDoctor->id]);
                    $this->command->info("Assigned assistant {$assistant->email} to first approved doctor {$firstDoctor->email} (User ID: {$firstDoctor->id})");
                    $fixed++;
                } else {
                    $this->command->warn("Assistant {$assistant->email} has NULL doctor_id and no approved doctor found to assign.");
                }
            }
        }

        $this->command->info("Fix complete. {$fixed} assistant(s) corrected.");
    }
}
