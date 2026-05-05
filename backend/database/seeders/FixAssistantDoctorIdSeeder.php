<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use Illuminate\Database\Seeder;

class FixAssistantDoctorIdSeeder extends Seeder
{
    /**
     * Fix ALL assistants whose doctor_id might be pointing to the
     * doctors table ID instead of the users table ID.
     */
    public function run(): void
    {
        $assistants = User::where('role', 'assistant')
            ->whereNotNull('doctor_id')
            ->get();

        $fixed = 0;

        foreach ($assistants as $assistant) {
            $doctorId = $assistant->doctor_id;

            // Check if doctor_id points to a valid user with role 'doctor'
            $validDoctorUser = User::where('id', $doctorId)
                ->where('role', 'doctor')
                ->exists();

            if (!$validDoctorUser) {
                // doctor_id likely points to the doctors table ID, not the users table ID.
                // Look up the doctor profile to get the correct user_id.
                $doctorProfile = Doctor::find($doctorId);

                if ($doctorProfile) {
                    $assistant->update(['doctor_id' => $doctorProfile->user_id]);
                    $this->command->info("Fixed assistant {$assistant->email}: doctor_id {$doctorId} -> {$doctorProfile->user_id}");
                    $fixed++;
                } else {
                    $this->command->warn("Assistant {$assistant->email} has doctor_id={$doctorId} which doesn't match any doctor user or profile.");
                }
            }
        }

        // Also fix assistants with NULL doctor_id (shouldn't happen but safety net)
        $nullCount = User::where('role', 'assistant')
            ->whereNull('doctor_id')
            ->count();

        if ($nullCount > 0) {
            $this->command->warn("{$nullCount} assistant(s) have NULL doctor_id. They need to be reassigned manually.");
        }

        $this->command->info("Fix complete. {$fixed} assistant(s) corrected.");
    }
}
