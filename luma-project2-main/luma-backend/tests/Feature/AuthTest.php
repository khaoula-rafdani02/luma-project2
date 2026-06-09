<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests Fonctionnels - Authentification
 *
 * Couvre : register, login, logout, accès au profil
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ─── REGISTER ───────────────────────────────────────────────────────────

    /** Un nouvel utilisateur peut s'inscrire avec des données valides */
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Amina Test',
            'email'                 => 'amina@luma.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'phone'                 => '+212600000001',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['access_token', 'token_type', 'user']);

        $this->assertDatabaseHas('users', ['email' => 'amina@luma.com']);
    }

    /** L'inscription échoue si l'email est déjà utilisé */
    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@luma.com']);

        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Autre Utilisateur',
            'email'                 => 'existing@luma.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    /** L'inscription échoue si le mot de passe est trop court */
    public function test_register_fails_with_short_password(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@luma.com',
            'password'              => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertStatus(422);
    }

    // ─── LOGIN ───────────────────────────────────────────────────────────────

    /** Un utilisateur peut se connecter avec les bons identifiants */
    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email'    => 'client@luma.com',
            'password' => bcrypt('password123'),
            'role'     => 'client',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'client@luma.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['access_token', 'token_type', 'expires_in', 'user']);
    }

    /** La connexion échoue avec un mauvais mot de passe */
    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'client@luma.com',
            'password' => bcrypt('correct_password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'client@luma.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401);
    }

    /** La connexion échoue si l'email n'existe pas */
    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'nobody@luma.com',
            'password' => 'somepassword',
        ]);

        $response->assertStatus(401);
    }

    // ─── PROFIL PROTÉGÉ ──────────────────────────────────────────────────────

    /** Un invité ne peut pas accéder à son profil */
    public function test_guest_cannot_access_me_endpoint(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    /** Un utilisateur authentifié peut accéder à ses informations */
    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson('/api/auth/me');

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => $user->email]);
    }
}
