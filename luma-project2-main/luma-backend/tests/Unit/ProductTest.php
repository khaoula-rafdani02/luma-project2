<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test final price calculation when sale price is null.
     */
    public function test_final_price_falls_back_to_regular_price_when_sale_price_is_null(): void
    {
        $product = new Product([
            'price' => 1200.00,
            'sale_price' => null,
        ]);

        $this->assertEquals(1200.00, $product->final_price);
    }

    /**
     * Test final price calculation when sale price is set.
     */
    public function test_final_price_uses_sale_price_when_present(): void
    {
        $product = new Product([
            'price' => 1200.00,
            'sale_price' => 950.00,
        ]);

        $this->assertEquals(950.00, $product->final_price);
    }
}
