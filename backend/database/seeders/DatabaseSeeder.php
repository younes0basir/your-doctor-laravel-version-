<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Appointment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin users
        User::updateOrCreate(
            ['email' => 'admin@yourdoctor.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => '+33123456789',
            ]
        );

        User::updateOrCreate(
            ['email' => 'itsmezoubaa@gmail.com'],
            [
                'first_name' => 'Mohammed',
                'last_name' => 'Zoubaa',
                'password' => Hash::make('itsmezoubaa@gmail.com'),
                'role' => 'patient',
                'status' => 'active',
                'phone' => '+212600000000',
            ]
        );

        // Create sample doctors
        $doctorUsers = [
            [
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'email' => 'dr.dupont@yourdoctor.com',
                'specialty' => 'Cardiology',
                'license' => 'CARD-001',
            ],
            [
                'first_name' => 'Marie',
                'last_name' => 'Martin',
                'email' => 'dr.martin@yourdoctor.com',
                'specialty' => 'Pediatrics',
                'license' => 'PED-001',
            ],
            [
                'first_name' => 'Pierre',
                'last_name' => 'Bernard',
                'email' => 'dr.bernard@yourdoctor.com',
                'specialty' => 'Dermatology',
                'license' => 'DERM-001',
            ],
        ];

        foreach ($doctorUsers as $doc) {
            $user = User::create([
                'first_name' => $doc['first_name'],
                'last_name' => $doc['last_name'],
                'email' => $doc['email'],
                'password' => Hash::make('password'),
                'role' => 'doctor',
                'status' => 'active',
                'phone' => '+336' . rand(10000000, 99999999),
            ]);

            Doctor::create([
                'user_id' => $user->id,
                'specialty' => $doc['specialty'],
                'license_number' => $doc['license'],
                'education' => 'MD from University of Paris',
                'experience_years' => rand(5, 20),
                'consultation_fee' => rand(50, 150),
                'status' => 'approved',
                'available_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'available_time_start' => '09:00',
                'available_time_end' => '17:00',
            ]);
        }

        // Create sample patients
        $patients = [
            ['first_name' => 'Sophie', 'last_name' => 'Petit', 'email' => 'sophie@email.com'],
            ['first_name' => 'Lucas', 'last_name' => 'Robert', 'email' => 'lucas@email.com'],
            ['first_name' => 'Emma', 'last_name' => 'Richard', 'email' => 'emma@email.com'],
        ];

        foreach ($patients as $patient) {
            User::create([
                'first_name' => $patient['first_name'],
                'last_name' => $patient['last_name'],
                'email' => $patient['email'],
                'password' => Hash::make('password'),
                'role' => 'patient',
                'status' => 'active',
                'phone' => '+336' . rand(10000000, 99999999),
            ]);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin: admin@yourdoctor.com / password');
        $this->command->info('Doctors and patients created with password: password');
    }
}
