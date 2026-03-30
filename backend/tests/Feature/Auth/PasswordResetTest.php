<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_password_reset_link()
    {
        $user = User::create([
            'name' => 'Hamza Lafsioui',
            'email' => 'hamza@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);

        $response = $this->postJson('/api/auth/password/email', [
            'email' => 'hamza@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => __(Password::RESET_LINK_SENT)]);
    }

    public function test_user_cannot_request_reset_link_for_non_existent_email()
    {
        $response = $this->postJson('/api/auth/password/email', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_reset_password_with_valid_token()
    {
        $user = User::create([
            'name' => 'Hamza Lafsioui',
            'email' => 'hamza@example.com',
            'password' => bcrypt('old_password'),
            'role' => 'student',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/auth/password/reset', [
            'token' => $token,
            'email' => 'hamza@example.com',
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => __(Password::PASSWORD_RESET)]);

        $this->assertTrue(Hash::check('new_password', $user->fresh()->password));
    }

    public function test_user_cannot_reset_password_with_invalid_token()
    {
        $user = User::create([
            'name' => 'Hamza Lafsioui',
            'email' => 'hamza@example.com',
            'password' => bcrypt('old_password'),
            'role' => 'student',
        ]);

        $response = $this->postJson('/api/auth/password/reset', [
            'token' => 'invalid-token',
            'email' => 'hamza@example.com',
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => __(Password::INVALID_TOKEN)]);
    }
}
