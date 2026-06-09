<?php

$images = [
    'category_robes.jpg' => 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1000&auto=format&fit=crop',
    'category_manteaux.jpg' => 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&auto=format&fit=crop&q=90',
    'category_accs.jpg' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
    'category_kids.jpg' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop&q=90',
    'category_ensembles_kids.jpg' => 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1000&auto=format&fit=crop',
    'category_kids_accs.jpg' => 'https://images.unsplash.com/photo-1519242220831-09410926fbff?q=80&w=1000&auto=format&fit=crop',
    'product_soie_noire.jpg' => 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1000&auto=format&fit=crop',
    'product_cachemire_blanc.jpg' => 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&auto=format&fit=crop&q=90',
    'product_cuir_fauve.jpg' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
    'product_emeraude.jpg' => 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=90',
    'product_alpaga.jpg' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=90',
    'product_pochette.jpg' => 'https://images.unsplash.com/photo-1566150905458-1bf1fc15aeb9?w=1000&auto=format&fit=crop&q=90',
    'product_abaya.jpg' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    'product_trench.jpg' => 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    'product_champagne.jpg' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    'product_cabas.jpg' => 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1000&auto=format&fit=crop',
    'product_kids_bio.jpg' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop&q=90',
    'product_kids_lin.jpg' => 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1000&auto=format&fit=crop&q=90',
    'product_kids_cachemire.jpg' => 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1000&auto=format&fit=crop&q=90',
    'product_kids_tulle.jpg' => 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1000&auto=format&fit=crop&q=90',
    'product_kids_manteau.jpg' => 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1000&auto=format&fit=crop',
    'product_kids_celeste.jpg' => 'https://images.unsplash.com/photo-1471286174240-e51a896cb500?q=80&w=1000&auto=format&fit=crop',
    'product_kids_mocassins.jpg' => 'https://images.unsplash.com/photo-1519242220831-09410926fbff?q=80&w=1000&auto=format&fit=crop',
    'product_kids_cape.jpg' => 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?q=80&w=1000&auto=format&fit=crop',
];

$dir = __DIR__ . '/public/images';
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

echo "Starting download of seeder images to: $dir\n";

foreach ($images as $filename => $url) {
    $path = "$dir/$filename";
    echo "Downloading $filename... ";
    
    // Attempt download
    $data = @file_get_contents($url);
    if ($data !== false) {
        file_put_contents($path, $data);
        echo "SUCCESS\n";
    } else {
        // Create colored placeholder if download fails
        echo "FAILED. Creating colored SVG placeholder instead.\n";
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
            <rect width="800" height="1000" fill="#FAF7F4"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#C8956C" letter-spacing="4">LUMA LUXURY</text>
        </svg>';
        file_put_contents(str_replace('.jpg', '.svg', $path), $svg);
    }
}

echo "Image download script completed.\n";
