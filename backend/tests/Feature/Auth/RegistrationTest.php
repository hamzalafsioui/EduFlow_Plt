<?php

namespace Tests\Feature\Auth;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_student_with_interests()
    {
        $category = Category::create(['name' => 'IT', 'slug' => 'it']);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Hamza Lafsioui',
            'email' => 'hamza@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'student',
            'interests' => [$category->id],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'student');

        $this->assertDatabaseHas('users', [
            'email' => 'hamza@example.com',
            'role' => 'student',
        ]);
    }

    public function test_user_can_register_as_teacher()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'ahmed',
            'email' => 'ahmed@teacher.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'teacher',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'teacher');
    }

    public function test_role_cannot_be_modified_after_registration()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);

        $user->update(['role' => 'teacher']);

        $this->assertEquals('student', $user->fresh()->role);
    }
}
