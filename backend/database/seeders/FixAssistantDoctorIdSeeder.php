<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use Illuminate\Database\Seeder;

class FixAssistantDoctorIdSeeder extends Seeder
{
    public function run(): void
    {
        $doctorUser = User::where('email', 'dr.dupont@yourdoctor.com')->first();
        $assistantUser = User::where('email', 'a@yourdoctor.com')->first();

        if ($doctorUser && $assistantUser) {
            $assistantUser->update(['doctor_id' => $doctorUser->id]);
            $this->command->info('Assistant a@yourdoctor.com successfully linked to doctor dr.dupont@yourdoctor.com (User ID: ' . $doctorUser->id . ')');
        } else {
            $this->command->error('Could not find doctor or assistant user.');
        }
    }
}
