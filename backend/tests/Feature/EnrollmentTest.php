<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\Category;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Mockery;
use Stripe\Checkout\Session;

class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticateUser($user)
    {
        $token = JWTAuth::fromUser($user);
        return $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    public function test_student_can_create_checkout_session()
    {
        $student = User::factory()->create(['role' => 'student', 'password' => bcrypt('password')]);
        $teacher = User::factory()->create(['role' => 'teacher', 'password' => bcrypt('password')]);
        
        $category = Category::create(['name' => 'Web Dev', 'slug' => 'web-dev']);
        $course = Course::create([
            'title' => 'Laravel Beginners',
            'description' => 'Learn Laravel',
            'price' => 10.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher->id
        ]);

        // Mock Stripe Session
        Mockery::mock('alias:\Stripe\Stripe')->shouldReceive('setApiKey')->andReturnNull();
        $mockSession = (object)['url' => 'https://checkout.stripe.com/pay/cs_test_simulated'];
        $mock = Mockery::mock('alias:' . Session::class);
        $mock->shouldReceive('create')->once()->andReturn($mockSession);

        $response = $this->authenticateUser($student)->postJson("/api/courses/{$course->id}/checkout");
        $response->assertStatus(200);
        $response->assertJson(['checkout_url' => 'https://checkout.stripe.com/pay/cs_test_simulated']);
    }

    public function test_student_can_enroll_success()
    {
        $student = User::factory()->create(['role' => 'student', 'password' => bcrypt('password')]);
        $teacher = User::factory()->create(['role' => 'teacher', 'password' => bcrypt('password')]);
        
        $category = Category::create(['name' => 'Web Dev', 'slug' => 'web-dev']);
        $course = Course::create([
            'title' => 'Laravel Beginners',
            'description' => 'Learn Laravel',
            'price' => 10.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher->id
        ]);

        $response = $this->authenticateUser($student)->getJson("/api/courses/{$course->id}/enroll/success");
        $response->assertStatus(200);
        
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'course_id' => $course->id
        ]);
    }

    public function test_student_can_withdraw()
    {
        $student = User::factory()->create(['role' => 'student', 'password' => bcrypt('password')]);
        $teacher = User::factory()->create(['role' => 'teacher', 'password' => bcrypt('password')]);
        
        $category = Category::create(['name' => 'Web Dev', 'slug' => 'web-dev']);
        $course = Course::create([
            'title' => 'Laravel Beginners',
            'description' => 'Learn Laravel',
            'price' => 10.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher->id
        ]);

        $student->enrolledCourses()->attach($course->id);

        $response = $this->authenticateUser($student)->deleteJson("/api/courses/{$course->id}/enroll");
        $response->assertStatus(200);
        
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $student->id,
            'course_id' => $course->id
        ]);
    }
}
