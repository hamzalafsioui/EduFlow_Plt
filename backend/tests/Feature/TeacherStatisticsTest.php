<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\Category;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class TeacherStatisticsTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticateUser($user)
    {
        $token = JWTAuth::fromUser($user);
        return $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    public function test_teacher_can_view_course_students()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student1 = User::factory()->create(['role' => 'student']);
        $student2 = User::factory()->create(['role' => 'student']);
        
        $category = Category::create(['name' => 'Web Dev', 'slug' => 'web-dev']);
        $course = Course::create([
            'title' => 'Laravel Beginners',
            'description' => 'Learn Laravel',
            'price' => 10.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher->id
        ]);

        $student1->enrolledCourses()->attach($course->id);
        $student2->enrolledCourses()->attach($course->id);

        $response = $this->authenticateUser($teacher)->getJson("/api/teacher/courses/{$course->id}/students");
        $response->assertStatus(200);
        $response->assertJsonCount(2);
    }

    public function test_teacher_can_view_statistics()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student1 = User::factory()->create(['role' => 'student']);
        
        $category = Category::create(['name' => 'Web Dev', 'slug' => 'web-dev']);
        $course1 = Course::create([
            'title' => 'Laravel Beginners',
            'description' => 'Learn Laravel',
            'price' => 100.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher->id
        ]);
        
        $course2 = Course::create([
            'title' => 'Advanced Laravel',
            'description' => 'Learn more',
            'price' => 200.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher->id
        ]);

        $student1->enrolledCourses()->attach($course1->id);

        $response = $this->authenticateUser($teacher)->getJson("/api/teacher/statistics");
        $response->assertStatus(200);
        $response->assertJson([
            'total_courses' => 2,
            'total_students' => 1,
            'total_revenue' => 100.0
        ]);
    }
}
