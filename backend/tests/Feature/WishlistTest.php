<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\Category;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticateUser($user)
    {
        $token = JWTAuth::fromUser($user);
        return $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    public function test_student_can_toggle_course_in_wishlist()
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

        // Add to wishlist
        $response = $this->authenticateUser($student)->postJson('/api/wishlist/courses/' . $course->id);
        $response->assertStatus(200);
        $response->assertJson(['message' => 'Wishlist updated successfully']);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $student->id,
            'course_id' => $course->id
        ]);

        // Remove from wishlist (toggle)
        $response2 = $this->authenticateUser($student)->postJson('/api/wishlist/courses/' . $course->id);
        $response2->assertStatus(200);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $student->id,
            'course_id' => $course->id
        ]);
    }

    public function test_student_can_get_wishlist()
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

        $student->wishlistCourses()->attach($course->id);

        $response = $this->authenticateUser($student)->getJson('/api/wishlist');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['title' => 'Laravel Beginners']);
    }

    public function test_teacher_cannot_access_wishlist()
    {
        $teacher = User::factory()->create(['role' => 'teacher', 'password' => bcrypt('password')]);
        $teacher2 = User::factory()->create(['role' => 'teacher', 'password' => bcrypt('password')]);
        
        $category = Category::create(['name' => 'Web Dev', 'slug' => 'web-dev']);
        $course = Course::create([
            'title' => 'Laravel Beginners',
            'description' => 'Learn Laravel',
            'price' => 10.0,
            'category_id' => $category->id,
            'teacher_id' => $teacher2->id
        ]);

        $response = $this->authenticateUser($teacher)->postJson('/api/wishlist/courses/' . $course->id);
        $response->assertStatus(403);
    }
}
