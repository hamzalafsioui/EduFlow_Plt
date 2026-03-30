<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class CourseRecommendationTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticateUser($user)
    {
        $token = JWTAuth::fromUser($user);
        return $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    public function test_student_gets_recommended_courses_matching_interests()
    {
        // 1 Setup users
        $student = User::factory()->create(['role' => 'student', 'password' => bcrypt('password')]);
        $teacher = User::factory()->create(['role' => 'teacher', 'password' => bcrypt('password')]);
        
        // 2 Setup categories
        $category1 = Category::create(['name' => 'Web Development', 'slug' => 'web-development']);
        $category2 = Category::create(['name' => 'Data Science', 'slug' => 'data-science']);
        
        // 3 Attach interest to student
        $student->interests()->attach($category1->id);
        
        // 4 Setup courses
        
        $course1 = Course::create([
            'title' => 'Laravel Beginners',
            'description' => 'Learn Laravel',
            'price' => 10.0,
            'category_id' => $category1->id,
            'teacher_id' => $teacher->id
        ]);

        $course2 = Course::create([
            'title' => 'Python for DS',
            'description' => 'Learn Python',
            'price' => 20.0,
            'category_id' => $category2->id,
            'teacher_id' => $teacher->id
        ]);

        // 5 Assert student gets only course1
        $response = $this->authenticateUser($student)->getJson('/api/courses/recommended');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['title' => 'Laravel Beginners']);
        $response->assertJsonMissing(['title' => 'Python for DS']);
    }

    public function test_student_without_interests_gets_empty_list()
    {
        $student = User::factory()->create(['role' => 'student']);
        
        $response = $this->authenticateUser($student)->getJson('/api/courses/recommended');
        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }

    public function test_teacher_gets_empty_list_for_recommendations()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        
        $response = $this->authenticateUser($teacher)->getJson('/api/courses/recommended');
        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }
}
