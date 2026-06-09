<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests Fonctionnels - Gestion Admin des Produits
 *
 * Couvre : accès restreint, liste, création, modification, suppression
 */
class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'password' => bcrypt('admin123')]);
    }

    private function makeClient(): User
    {
        return User::factory()->create(['role' => 'client', 'password' => bcrypt('client123')]);
    }

    private function makeCategory(): Category
    {
        return Category::create([
            'name'      => 'Robes Test',
            'slug'      => 'robes-test-' . uniqid(),
            'gender'    => 'women',
            'is_active' => true,
        ]);
    }

    private function authHeader(User $user): array
    {
        $token = auth('api')->login($user);
        return ['Authorization' => "Bearer $token"];
    }

    // ─── ACCÈS RESTREINT ─────────────────────────────────────────────────────

    /** Un invité ne peut pas lister les produits admin */
    public function test_guest_cannot_access_admin_products(): void
    {
        $this->getJson('/api/admin/products')->assertStatus(401);
    }

    /** Un client ne peut pas accéder à l'espace admin */
    public function test_client_cannot_access_admin_products(): void
    {
        $client = $this->makeClient();

        $this->withHeaders($this->authHeader($client))
             ->getJson('/api/admin/products')
             ->assertStatus(403);
    }

    // ─── LISTE ───────────────────────────────────────────────────────────────

    /** Un admin peut lister tous les produits */
    public function test_admin_can_list_all_products(): void
    {
        $admin    = $this->makeAdmin();
        $category = $this->makeCategory();

        Product::create([
            'name'        => 'Robe Test',
            'slug'        => 'robe-test-' . uniqid(),
            'category_id' => $category->id,
            'price'       => 1500.00,
            'gender'      => 'women',
            'is_active'   => true,
        ]);

        $this->withHeaders($this->authHeader($admin))
             ->getJson('/api/admin/products')
             ->assertStatus(200)
             ->assertJsonStructure([['id', 'name', 'price', 'gender', 'category']]);
    }

    // ─── CRÉATION ────────────────────────────────────────────────────────────

    /** Un admin peut créer un produit avec une URL d'image */
    public function test_admin_can_create_product_with_image_url(): void
    {
        Storage::fake('public');

        $admin    = $this->makeAdmin();
        $category = $this->makeCategory();

        $response = $this->withHeaders($this->authHeader($admin))
                         ->postJson('/api/admin/products', [
                             'name'        => 'Manteau Luxe',
                             'category_id' => $category->id,
                             'description' => 'Un beau manteau.',
                             'price'       => 6500,
                             'gender'      => 'women',
                             'is_active'   => true,
                             'is_featured' => false,
                             'stock'       => 20,
                             'image'       => 'https://images.unsplash.com/photo-test.jpg',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Manteau Luxe']);

        $this->assertDatabaseHas('products', ['name' => 'Manteau Luxe']);
    }

    /** Un admin peut créer un produit avec un fichier image uploadé */
    public function test_admin_can_create_product_with_uploaded_image(): void
    {
        Storage::fake('public');

        $admin    = $this->makeAdmin();
        $category = $this->makeCategory();

        // Utilisation de create() pour éviter la dépendance à l'extension GD
        $fakeImage = UploadedFile::fake()->create('product.jpg', 100, 'image/jpeg');

        $response = $this->withHeaders($this->authHeader($admin))
                         ->post('/api/admin/products', [
                             'name'        => 'Robe Upload Test',
                             'category_id' => (string) $category->id,
                             'price'       => '3500',
                             'gender'      => 'women',
                             'is_active'   => '1',
                             'is_featured' => '0',
                             'stock'       => '10',
                             'image'       => $fakeImage,
                         ], $this->authHeader($admin));

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', ['name' => 'Robe Upload Test']);
    }

    /** La création échoue si le prix est manquant */
    public function test_create_product_fails_without_price(): void
    {
        $admin    = $this->makeAdmin();
        $category = $this->makeCategory();

        $this->withHeaders($this->authHeader($admin))
             ->postJson('/api/admin/products', [
                 'name'        => 'Produit Sans Prix',
                 'category_id' => $category->id,
                 'gender'      => 'women',
             ])
             ->assertStatus(422);
    }

    // ─── SUPPRESSION ─────────────────────────────────────────────────────────

    /** Un admin peut supprimer un produit existant */
    public function test_admin_can_delete_product(): void
    {
        $admin    = $this->makeAdmin();
        $category = $this->makeCategory();

        $product = Product::create([
            'name'        => 'Produit à Supprimer',
            'slug'        => 'produit-a-supprimer-' . uniqid(),
            'category_id' => $category->id,
            'price'       => 500,
            'gender'      => 'women',
            'is_active'   => true,
        ]);

        $this->withHeaders($this->authHeader($admin))
             ->deleteJson("/api/admin/products/{$product->id}")
             ->assertStatus(200)
             ->assertJsonFragment(['message' => 'Produit supprimé']);

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    /** Un client ne peut pas supprimer un produit */
    public function test_client_cannot_delete_product(): void
    {
        $client   = $this->makeClient();
        $category = $this->makeCategory();

        $product = Product::create([
            'name'        => 'Produit Protégé',
            'slug'        => 'produit-protege-' . uniqid(),
            'category_id' => $category->id,
            'price'       => 500,
            'gender'      => 'women',
            'is_active'   => true,
        ]);

        $this->withHeaders($this->authHeader($client))
             ->deleteJson("/api/admin/products/{$product->id}")
             ->assertStatus(403);
    }
}
