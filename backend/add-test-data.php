<?php

// Laravel Tinker script to add test data for admin dashboard

use App\Models\User;
use App\Models\Doctor;
use App\Models\Appointment;
use Carbon\Carbon;

echo "Adding test data for admin dashboard...\n\n";

// Create some test patients
for ($i = 1; $i <= 5; $i++) {
    User::create([
        'first_name' => "Patient{$i}",
        'last_name' => "User{$i}",
        'email' => "patient{$i}@test.com",
        'password' => bcrypt('password123'),
        'role' => 'patient',
        'status' => 'active',
        'phone' => "+123456789{$i}",
        'created_at' => Carbon::now()->subDays(rand(1, 60)),
    ]);
}
echo "✓ Created 5 test patients\n";

// Create some test doctors
for ($i = 1; $i <= 3; $i++) {
    $user = User::create([
        'first_name' => "Dr. Doctor{$i}",
        'last_name' => "Specialist{$i}",
        'email' => "doctor{$i}@test.com",
        'password' => bcrypt('password123'),
        'role' => 'doctor',
        'status' => 'approved',
        'phone' => "+198765432{$i}",
        'created_at' => Carbon::now()->subDays(rand(1, 60)),
    ]);
    
    Doctor::create([
        'user_id' => $user->id,
        'specialty' => ['Cardiology', 'Dermatology', 'Pediatrics'][$i - 1],
        'experience' => rand(5, 20) . ' years',
        'status' => 'approved',
        'about' => "Experienced {$i} doctor",
        'fees' => rand(50, 150),
    ]);
}
echo "✓ Created 3 test doctors\n";

// Create some test appointments
$patients = User::where('role', 'patient')->get();
$doctors = User::where('role', 'doctor')->get();

if ($patients->count() > 0 && $doctors->count() > 0) {
    for ($i = 1; $i <= 10; $i++) {
        $patient = $patients->random();
        $doctor = $doctors->random();
        $appointmentDate = Carbon::now()->subDays(rand(0, 30))->addHours(rand(8, 17));
        
        Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => $appointmentDate,
            'status' => ['pending', 'confirmed', 'completed', 'completed', 'completed'][rand(0, 4)],
            'type' => ['consultation', 'follow-up', 'emergency'][rand(0, 2)],
            'payment_status' => ['paid', 'paid', 'pending'][rand(0, 2)],
            'amount' => rand(50, 150),
            'created_at' => $appointmentDate->copy()->subDays(rand(1, 5)),
        ]);
    }
    echo "✓ Created 10 test appointments\n";
} else {
    echo "⚠ Cannot create appointments - need patients and doctors first\n";
}

echo "\n✅ Test data creation complete!\n";
echo "You can now login and see data in the admin dashboard.\n";
