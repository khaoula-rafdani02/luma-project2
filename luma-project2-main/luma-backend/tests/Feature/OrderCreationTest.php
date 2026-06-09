<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderCreationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guest users cannot place orders and are redirected or denied.
     */
    public function test_guest_users_cannot_create_orders_without_authentication(): void
    {
        $response = $this->postJson('/api/client/orders', [
            'payment_method' => 'cod',
            'shipping_address' => [
                'name' => 'John Doe',
                'address' => '123 Luxury Ave',
                'city' => 'Casablanca',
                'phone' => '+212600000000',
            ]
        ]);

        $response->assertStatus(401);
    }
}
