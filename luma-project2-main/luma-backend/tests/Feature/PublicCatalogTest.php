<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests Fonctionnels - API Publique (Produits & Catégories)
 *
 * Couvre : liste publique, détail produit, filtres, routes inexistantes
 */
class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Crée un jeu de données de test : 1 catégorie + 1 produit + 1 variante.
     */
    private function seedCatalog(): array
    {
        $category = Category::create([
            'name'      => 'Robes Publiques',
            'slug'      => 'robes-publiques-' . uniqid(),
            'gender'    => 'women',
            'is_active' => true,
        ]);

        $product = Product::create([
            'name'        => 'Robe Élégante',
            'slug'        => 'robe-elegante-' . uniqid(),
            'description' => 'Une belle robe.',
            'category_id' => $category->id,
            'price'       => 3200.00,
            'sale_price'  => 2800.00,
            'gender'      => 'women',
            'is_active'   => true,
            'is_featured' => true,
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'size'       => 'M',
            'color'      => 'Noir',
            'color_hex'  => '#000000',
            'stock'      => 15,
            'sku'        => 'RE-NOIR-M-' . uniqid(),
        ]);

        return compact('category', 'product');
    }

    // ─── CATÉGORIES ──────────────────────────────────────────────────────────

    /** La liste des catégories est publiquement accessible */
    public function test_categories_endpoint_is_publicly_accessible(): void
    {
        $this->seedCatalog();

        $this->getJson('/api/categories')
             ->assertStatus(200)
             ->assertJsonStructure([['id', 'name', 'slug', 'gender']]);
    }

    /** La liste des catégories retourne uniquement les catégories actives */
    public function test_categories_returns_only_active_categories(): void
    {
        Category::create([
            'name'      => 'Catégorie Inactive',
            'slug'      => 'cat-inactive-' . uniqid(),
            'gender'    => 'women',
            'is_active' => false,
        ]);

        Category::create([
            'name'      => 'Catégorie Active',
            'slug'      => 'cat-active-' . uniqid(),
            'gender'    => 'women',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/categories');
        $response->assertStatus(200);

        $names = collect($response->json())->pluck('name')->toArray();
        $this->assertContains('Catégorie Active', $names);
        $this->assertNotContains('Catégorie Inactive', $names);
    }

    // ─── PRODUITS ────────────────────────────────────────────────────────────

    /** La liste des produits est publiquement accessible */
    public function test_products_endpoint_is_publicly_accessible(): void
    {
        $this->seedCatalog();

        $response = $this->getJson('/api/products');
        $response->assertStatus(200);

        // L'API retourne une réponse paginée avec une clé 'data'
        $data = $response->json('data') ?? $response->json();
        $this->assertNotEmpty($data);
    }

    /** La liste des produits contient les infos de prix final */
    public function test_product_list_includes_sale_price(): void
    {
        $this->seedCatalog();

        $response = $this->getJson('/api/products');
        $response->assertStatus(200);

        // Support réponse paginée ou tableau direct
        $firstProduct = ($response->json('data')[0]) ?? ($response->json()[0]) ?? null;
        $this->assertNotNull($firstProduct);
        $this->assertArrayHasKey('price', $firstProduct);
        $this->assertArrayHasKey('sale_price', $firstProduct);
    }

    /** On peut accéder au détail d'un produit par son slug */
    public function test_product_detail_is_accessible_by_slug(): void
    {
        ['product' => $product] = $this->seedCatalog();

        $this->getJson("/api/products/{$product->slug}")
             ->assertStatus(200)
             ->assertJsonFragment(['name' => 'Robe Élégante'])
             ->assertJsonStructure(['id', 'name', 'price', 'description', 'variants', 'images']);
    }

    /** Un slug invalide retourne une erreur 404 */
    public function test_product_detail_returns_404_for_invalid_slug(): void
    {
        $this->getJson('/api/products/slug-qui-nexiste-pas')
             ->assertStatus(404);
    }

    /** Le détail du produit inclut ses variantes */
    public function test_product_detail_includes_variants(): void
    {
        ['product' => $product] = $this->seedCatalog();

        $response = $this->getJson("/api/products/{$product->slug}");
        $response->assertStatus(200);

        $variants = $response->json('variants');
        $this->assertIsArray($variants);
        $this->assertNotEmpty($variants);
        $this->assertEquals('M', $variants[0]['size']);
        $this->assertEquals('Noir', $variants[0]['color']);
    }
}
