<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Course;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teacher = User::where('role', 'teacher')->first() 
            ?? User::factory()->create(['role' => 'teacher']);
        
        $category = Category::first() 
            ?? Category::create(['name' => 'Web Development', 'slug' => 'web-development']);

        Course::create([
            'teacher_id' => $teacher->id,
            'category_id' => $category->id,
            'title' => 'Laravel for Beginners',
            'description' => 'Learn the basics of Laravel framework.',
            'price' => 49.99,
        ]);

        Course::create([
            'teacher_id' => $teacher->id,
            'category_id' => $category->id,
            'title' => 'Advanced PHP Patterns',
            'description' => 'Deep dive into PHP design patterns.',
            'price' => 99.99,
        ]);
    }
}
