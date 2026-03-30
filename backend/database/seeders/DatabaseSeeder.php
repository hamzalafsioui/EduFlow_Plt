<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Student User',
            'email' => 'student@example.com',
            'role' => 'student',
            'password' => Hash::make('password123'),
        ]);
         User::factory()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@example.com',
            'role' => 'teacher',
            'password' => Hash::make('password123'),
        ]);

        $this->call(CategorySeeder::class);
        $this->call(CourseSeeder::class);
    }
}
