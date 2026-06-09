<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\Coupon;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Favorite;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RealDataSeeder extends Seeder
{
    public function run(): void
    {
        // ─────────────────────────────────────────
        // 1. COUPONS
        // ─────────────────────────────────────────
        $coupon1 = Coupon::updateOrCreate(['code' => 'LUMA20'], [
            'type'       => 'percent',
            'value'      => 20,
            'min_order'  => 1000,
            'max_uses'   => 100,
            'used_count' => 14,
            'expires_at' => Carbon::now()->addMonths(3),
            'is_active'  => true,
        ]);

        $coupon2 = Coupon::updateOrCreate(['code' => 'BIENVENUE10'], [
            'type'       => 'percent',
            'value'      => 10,
            'min_order'  => 500,
            'max_uses'   => 200,
            'used_count' => 47,
            'expires_at' => Carbon::now()->addMonths(6),
            'is_active'  => true,
        ]);

        $coupon3 = Coupon::updateOrCreate(['code' => 'FETE500'], [
            'type'       => 'fixed',
            'value'      => 500,
            'min_order'  => 3000,
            'max_uses'   => 50,
            'used_count' => 8,
            'expires_at' => Carbon::now()->addMonth(),
            'is_active'  => true,
        ]);

        Coupon::updateOrCreate(['code' => 'ETE2025'], [
            'type'       => 'percent',
            'value'      => 15,
            'min_order'  => 2000,
            'max_uses'   => null,
            'used_count' => 23,
            'expires_at' => Carbon::now()->subMonth(), // expiré
            'is_active'  => false,
        ]);

        // ─────────────────────────────────────────
        // 2. CLIENTS SUPPLÉMENTAIRES
        // ─────────────────────────────────────────
        $clients = [
            ['name' => 'Salma Idrissi',      'email' => 'salma.idrissi@gmail.com',    'phone' => '+212661234567'],
            ['name' => 'Nadia Benali',        'email' => 'nadia.benali@gmail.com',     'phone' => '+212672345678'],
            ['name' => 'Hind El Mansouri',   'email' => 'hind.mansouri@gmail.com',    'phone' => '+212683456789'],
            ['name' => 'Fatima Zahra Tazi',  'email' => 'fatima.tazi@gmail.com',      'phone' => '+212694567890'],
            ['name' => 'Khadija Ouazzani',   'email' => 'khadija.ouazzani@gmail.com', 'phone' => '+212605678901'],
            ['name' => 'Meriem Cherkaoui',   'email' => 'meriem.cherkaoui@gmail.com', 'phone' => '+212616789012'],
            ['name' => 'Layla Bensouda',     'email' => 'layla.bensouda@gmail.com',   'phone' => '+212627890123'],
            ['name' => 'Zineb Alaoui',       'email' => 'zineb.alaoui@gmail.com',     'phone' => '+212638901234'],
        ];

        $createdClients = [];
        foreach ($clients as $clientData) {
            $createdClients[] = User::updateOrCreate(
                ['email' => $clientData['email']],
                [
                    'name'     => $clientData['name'],
                    'password' => bcrypt('client123'),
                    'phone'    => $clientData['phone'],
                    'role'     => 'client',
                ]
            );
        }

        // récupérer le client principal aussi
        $mainClient = User::where('email', 'client@luma.com')->first();
        if ($mainClient) {
            array_unshift($createdClients, $mainClient);
        }

        // ─────────────────────────────────────────
        // 3. COMMANDES RÉELLES
        // ─────────────────────────────────────────
        $products  = Product::with('variants')->get();
        $statuses  = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered'];
        $payments  = ['card', 'cash_on_delivery', 'card'];
        $cities    = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'];

        $ordersData = [
            // Salma – commande livrée avec coupon
            [
                'client_idx' => 0,
                'status'     => 'delivered',
                'payment'    => 'card',
                'city'       => 'Casablanca',
                'coupon'     => $coupon1,
                'created_at' => Carbon::now()->subDays(45),
                'items'      => [
                    ['product_idx' => 0, 'qty' => 1],
                    ['product_idx' => 2, 'qty' => 1],
                ],
            ],
            // Nadia – commande en cours
            [
                'client_idx' => 1,
                'status'     => 'processing',
                'payment'    => 'card',
                'city'       => 'Rabat',
                'coupon'     => null,
                'created_at' => Carbon::now()->subDays(3),
                'items'      => [
                    ['product_idx' => 1, 'qty' => 1],
                ],
            ],
            // Hind – commande expédiée
            [
                'client_idx' => 2,
                'status'     => 'shipped',
                'payment'    => 'cash_on_delivery',
                'city'       => 'Marrakech',
                'coupon'     => null,
                'created_at' => Carbon::now()->subDays(7),
                'items'      => [
                    ['product_idx' => 3, 'qty' => 1],
                    ['product_idx' => 5, 'qty' => 1],
                ],
            ],
            // Fatima – livrée avec coupon fixe
            [
                'client_idx' => 3,
                'status'     => 'delivered',
                'payment'    => 'card',
                'city'       => 'Fès',
                'coupon'     => $coupon3,
                'created_at' => Carbon::now()->subDays(20),
                'items'      => [
                    ['product_idx' => 4, 'qty' => 1],
                ],
            ],
            // Khadija – en attente
            [
                'client_idx' => 4,
                'status'     => 'pending',
                'payment'    => 'cash_on_delivery',
                'city'       => 'Tanger',
                'coupon'     => null,
                'created_at' => Carbon::now()->subDays(1),
                'items'      => [
                    ['product_idx' => 10, 'qty' => 2],
                ],
            ],
            // Meriem – livrée
            [
                'client_idx' => 5,
                'status'     => 'delivered',
                'payment'    => 'card',
                'city'       => 'Agadir',
                'coupon'     => $coupon2,
                'created_at' => Carbon::now()->subDays(60),
                'items'      => [
                    ['product_idx' => 6, 'qty' => 1],
                    ['product_idx' => 9, 'qty' => 1],
                ],
            ],
            // Layla – livrée
            [
                'client_idx' => 6,
                'status'     => 'delivered',
                'payment'    => 'card',
                'city'       => 'Casablanca',
                'coupon'     => null,
                'created_at' => Carbon::now()->subDays(30),
                'items'      => [
                    ['product_idx' => 7, 'qty' => 1],
                ],
            ],
            // Zineb – expédiée
            [
                'client_idx' => 7,
                'status'     => 'shipped',
                'payment'    => 'cash_on_delivery',
                'city'       => 'Rabat',
                'coupon'     => null,
                'created_at' => Carbon::now()->subDays(5),
                'items'      => [
                    ['product_idx' => 8, 'qty' => 1],
                    ['product_idx' => 11, 'qty' => 1],
                ],
            ],
            // Client principal – 2 commandes
            [
                'client_idx' => 0,
                'status'     => 'delivered',
                'payment'    => 'card',
                'city'       => 'Casablanca',
                'coupon'     => $coupon2,
                'created_at' => Carbon::now()->subDays(90),
                'items'      => [
                    ['product_idx' => 0, 'qty' => 1],
                ],
            ],
            [
                'client_idx' => 1,
                'status'     => 'delivered',
                'payment'    => 'card',
                'city'       => 'Rabat',
                'coupon'     => null,
                'created_at' => Carbon::now()->subDays(15),
                'items'      => [
                    ['product_idx' => 3, 'qty' => 1],
                    ['product_idx' => 2, 'qty' => 1],
                ],
            ],
        ];

        $productsArr = $products->values()->toArray();

        foreach ($ordersData as $orderData) {
            $client = $createdClients[$orderData['client_idx']] ?? $createdClients[0];

            $subtotal = 0;
            $lineItems = [];

            foreach ($orderData['items'] as $itemDef) {
                $idx     = $itemDef['product_idx'] % count($productsArr);
                $prod    = Product::find($productsArr[$idx]['id']);
                if (!$prod) continue;

                $variant  = $prod->variants()->first();
                $price    = $prod->sale_price ?? $prod->price;
                $qty      = $itemDef['qty'];
                $subtotal += $price * $qty;

                $lineItems[] = [
                    'product'  => $prod,
                    'variant'  => $variant,
                    'price'    => $price,
                    'qty'      => $qty,
                ];
            }

            $shipping  = 50;
            $discount  = 0;
            $couponObj = $orderData['coupon'];

            if ($couponObj) {
                if ($couponObj->type === 'percent') {
                    $discount = round($subtotal * $couponObj->value / 100);
                } else {
                    $discount = $couponObj->value;
                }
            }

            $total = max(0, $subtotal + $shipping - $discount);

            $order = Order::create([
                'user_id'          => $client->id,
                'status'           => $orderData['status'],
                'payment_method'   => $orderData['payment'],
                'payment_status'   => in_array($orderData['status'], ['delivered', 'shipped']) ? 'paid' : 'pending',
                'subtotal'         => $subtotal,
                'shipping_cost'    => $shipping,
                'discount'         => $discount,
                'total'            => $total,
                'coupon_id'        => $couponObj ? $couponObj->id : null,
                'shipping_address' => [
                    'name'    => $client->name,
                    'phone'   => $client->phone,
                    'address' => '123 Rue Mohammed V',
                    'city'    => $orderData['city'],
                    'zip'     => '20000',
                    'country' => 'Maroc',
                ],
                'created_at' => $orderData['created_at'],
                'updated_at' => $orderData['created_at'],
            ]);

            foreach ($lineItems as $li) {
                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $li['product']->id,
                    'product_variant_id' => $li['variant'] ? $li['variant']->id : 1,
                    'unit_price'         => $li['price'],
                    'quantity'           => $li['qty'],
                    'total_price'        => $li['price'] * $li['qty'],
                ]);
            }
        }

        // ─────────────────────────────────────────
        // 4. REVIEWS
        // ─────────────────────────────────────────
        $reviewsData = [
            ['client_idx' => 0, 'product_idx' => 0, 'rating' => 5, 'comment' => 'Absolument magnifique ! La soie est d\'une qualité exceptionnelle, le tombé est parfait. Je l\'ai portée pour un mariage et j\'ai reçu énormément de compliments.'],
            ['client_idx' => 1, 'product_idx' => 1, 'rating' => 5, 'comment' => 'Le manteau est divin, ultra chaud et élégant. La coupe est impeccable. Je recommande vivement !'],
            ['client_idx' => 2, 'product_idx' => 3, 'rating' => 4, 'comment' => 'Très belle robe, couleur splendide. Légèrement grande pour ma taille habituelle, je recommande de prendre une taille en dessous.'],
            ['client_idx' => 3, 'product_idx' => 4, 'rating' => 5, 'comment' => 'Le manteau en alpaga est un vrai coup de cœur. Douceur incroyable et allure très chic. Expédition rapide et emballage luxueux.'],
            ['client_idx' => 5, 'product_idx' => 6, 'rating' => 4, 'comment' => 'L\'abaya est sublime, broderies très fines et délicates. Le tissu est léger et fluide. Parfaite pour les grandes occasions.'],
            ['client_idx' => 6, 'product_idx' => 7, 'rating' => 5, 'comment' => 'Le trench-coat est exactement comme sur les photos, peut-être encore plus beau en vrai. Matière de très haute qualité.'],
            ['client_idx' => 0, 'product_idx' => 2, 'rating' => 4, 'comment' => 'Sac de très belle qualité, cuir souple et parfumé. Les finitions dorées sont très élégantes. Je le recommande !'],
            ['client_idx' => 1, 'product_idx' => 5, 'rating' => 3, 'comment' => 'Jolie pochette mais un peu petite à mon goût. La qualité du cuir est néanmoins très bonne et le fermoir est solide.'],
        ];

        foreach ($reviewsData as $rd) {
            $clientIdx  = $rd['client_idx'] % count($createdClients);
            $client     = $createdClients[$clientIdx];
            $productIdx = $rd['product_idx'] % count($productsArr);
            $product    = Product::find($productsArr[$productIdx]['id']);
            if (!$product) continue;

            Review::updateOrCreate(
                ['user_id' => $client->id, 'product_id' => $product->id],
                [
                    'rating'  => $rd['rating'],
                    'comment' => $rd['comment'],
                ]
            );
        }

        // ─────────────────────────────────────────
        // 5. FAVORIS
        // ─────────────────────────────────────────
        $favoritesData = [
            [0, [0, 1, 4]],
            [1, [1, 3, 6]],
            [2, [0, 5, 7]],
            [3, [4, 8]],
            [4, [10, 11, 12]],
            [5, [6, 9]],
        ];

        foreach ($favoritesData as [$clientIdx, $productIdxList]) {
            $client = $createdClients[$clientIdx] ?? null;
            if (!$client) continue;

            foreach ($productIdxList as $pIdx) {
                $idx     = $pIdx % count($productsArr);
                $product = Product::find($productsArr[$idx]['id']);
                if (!$product) continue;

                Favorite::updateOrCreate([
                    'user_id'    => $client->id,
                    'product_id' => $product->id,
                ]);
            }
        }

        $this->command->info('✅ RealDataSeeder terminé : coupons, clients, commandes, reviews et favoris créés !');
    }
}
