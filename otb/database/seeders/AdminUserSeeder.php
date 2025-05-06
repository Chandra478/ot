<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'), // Change this password
            'role' => 'admin',
            'gender' => 'male', // or 'female'/'other'
            'class' => 'admin', // Special class for admin
            'is_approved' => true
        ]);

        // Create sample student for testing
        User::create([
            'name' => 'Test Student',
            'email' => 'student@test.com',
            'password' => Hash::make('student123'),
            'role' => 'student',
            'gender' => 'female',
            'class' => 'Class 10',
            'is_approved' => true
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@example.com');
        $this->command->info('Password: admin123');
    }
}
