<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirmation de commande – LUMA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: #F5F1EC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; }
        .wrapper { max-width: 620px; margin: 40px auto; background: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

        /* Header */
        .header { background-color: #1A1A1A; padding: 36px 40px; text-align: center; }
        .brand { font-size: 28px; font-weight: 900; letter-spacing: 8px; color: #fff; }
        .tagline { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #C8956C; margin-top: 6px; }

        /* Hero */
        .hero { background: linear-gradient(135deg, #C8956C 0%, #b07a54 100%); padding: 40px; text-align: center; }
        .check-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .hero h1 { font-size: 22px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; color: #fff; margin-bottom: 10px; }
        .hero p { font-size: 13px; color: rgba(255,255,255,0.85); line-height: 1.6; }
        .order-num { display: inline-block; margin-top: 16px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 6px 18px; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #fff; }

        /* Body */
        .body-content { padding: 36px 40px; }

        /* Delivery banner */
        .delivery-banner { background: #FAF7F4; border-left: 3px solid #C8956C; border-radius: 4px; padding: 16px 20px; margin-bottom: 32px; display: flex; align-items: flex-start; gap: 14px; }
        .delivery-text strong { display: block; font-size: 13px; color: #1A1A1A; margin-bottom: 4px; }
        .delivery-text span { font-size: 12px; color: #666; line-height: 1.5; }
        .delivery-badge { white-space: nowrap; background: #FEF3C7; color: #92400E; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; }

        /* Section title */
        .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #F0ECE8; }

        /* Items table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        .items-table thead tr th { padding: 10px 0; color: #888; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #F0ECE8; text-align: left; }
        .items-table thead tr th:last-child { text-align: right; }
        .items-table thead tr th:nth-child(2) { text-align: center; }
        .items-table tbody tr td { padding: 12px 0; border-bottom: 1px solid #F8F5F2; vertical-align: top; }
        .item-name { font-weight: 600; color: #1A1A1A; }
        .item-variant { font-size: 11px; color: #999; margin-top: 3px; }
        .item-qty { text-align: center; color: #666; }
        .item-price { text-align: right; font-weight: 600; color: #1A1A1A; }

        /* Totals */
        .totals { background: #FAF9F7; border-radius: 4px; padding: 16px 20px; margin-bottom: 32px; }
        .totals-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 6px 0; color: #555; }
        .totals-row.total { border-top: 1px solid #E8E2DB; margin-top: 8px; padding-top: 14px; font-size: 15px; font-weight: 700; color: #1A1A1A; }
        .totals-row.total .amount { color: #C8956C; }
        .free-shipping { color: #059669; font-weight: 600; }

        /* Info grid */
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .info-box { background: #FAF9F7; border-radius: 4px; padding: 16px; }
        .info-box .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #C8956C; margin-bottom: 8px; }
        .info-box .value { font-size: 12px; color: #444; line-height: 1.7; }
        .payment-badge { display: inline-block; background: #D1FAE5; color: #065F46; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Steps */
        .steps { margin-bottom: 32px; }
        .steps-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #F0ECE8; }
        .step { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
        .step-num { width: 28px; height: 28px; border-radius: 50%; background: #F0ECE8; color: #999; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .step-num.done { background: #C8956C; color: #fff; }
        .step-content { padding-top: 4px; }
        .step-content strong { display: block; font-size: 13px; color: #1A1A1A; margin-bottom: 2px; }
        .step-content span { font-size: 12px; color: #888; }

        /* CTA */
        .cta-section { text-align: center; margin-bottom: 8px; }
        .cta-btn { display: inline-block; background: #1A1A1A; color: #fff; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 14px 36px; border-radius: 4px; }

        /* Footer */
        .footer { background: #1A1A1A; padding: 28px 40px; text-align: center; }
        .brand-small { font-size: 16px; font-weight: 900; letter-spacing: 6px; color: #fff; margin-bottom: 12px; }
        .footer p { font-size: 11px; color: #888; line-height: 1.8; }
        .footer a { color: #C8956C; text-decoration: none; }

        @media (max-width: 480px) {
            .body-content { padding: 24px 20px; }
            .info-grid { grid-template-columns: 1fr; }
            .delivery-banner { flex-direction: column; }
        }
    </style>
</head>
<body>
<div class="wrapper">

    <!-- Header -->
    <div class="header">
        <div class="brand">LUMA</div>
        <div class="tagline">Haute Couture &amp; Prêt-à-porter</div>
    </div>

    <!-- Hero -->
    <div class="hero">
        <div class="check-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
        </div>
        <h1>Commande Confirmée</h1>
        <p>
            Merci, <strong style="color:#fff;">{{ $order->user->name ?? 'cher client' }}</strong> !<br>
            Votre commande a bien été reçue et est en cours de traitement.
        </p>
        <div class="order-num">Commande N° {{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</div>
    </div>

    <!-- Body -->
    <div class="body-content">

        <!-- Delivery Banner -->
        <div class="delivery-banner">
            <div style="font-size:24px; flex-shrink:0;">🚚</div>
            <div class="delivery-text">
                <strong>Délai de livraison estimé : 2 à 3 jours ouvrés</strong>
                <span>Notre équipe traite votre commande dans les 24h. Vous recevrez une notification dès l'expédition.</span>
            </div>
            <div class="delivery-badge">En attente</div>
        </div>

        <!-- Order Items -->
        <div class="section-title">Détail de la commande</div>

        @php
            $shippingAddress = is_array($order->shipping_address)
                ? $order->shipping_address
                : json_decode($order->shipping_address, true);
        @endphp

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width:55%">Article</th>
                    <th style="width:15%;text-align:center">Qté</th>
                    <th style="width:30%;text-align:right">Montant</th>
                </tr>
            </thead>
            <tbody>
                @forelse($order->items as $item)
                    <tr>
                        <td>
                            <div class="item-name">{{ $item->product->name ?? 'Article' }}</div>
                            @if($item->variant)
                                <div class="item-variant">
                                    @if($item->variant->size)Taille : {{ strtoupper($item->variant->size) }}@endif
                                    @if($item->variant->color) &bull; Couleur : {{ ucfirst($item->variant->color) }}@endif
                                </div>
                            @endif
                        </td>
                        <td class="item-qty">{{ $item->quantity }}</td>
                        <td class="item-price">{{ number_format($item->total_price, 2) }} MAD</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="3" style="padding:14px 0;font-size:12px;color:#aaa;text-align:center;">
                            Aucun article trouvé.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="totals-row">
                <span>Sous-total</span>
                <span>{{ number_format($order->subtotal, 2) }} MAD</span>
            </div>
            <div class="totals-row">
                <span>Livraison</span>
                @if($order->shipping_cost > 0)
                    <span>{{ number_format($order->shipping_cost, 2) }} MAD</span>
                @else
                    <span class="free-shipping">Gratuite</span>
                @endif
            </div>
            <div class="totals-row total">
                <span>Total</span>
                <span class="amount">{{ number_format($order->total, 2) }} MAD</span>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="section-title">Informations</div>
        <div class="info-grid">
            <div class="info-box">
                <div class="label">Adresse de livraison</div>
                <div class="value">
                    {{ $shippingAddress['name'] ?? '' }}<br>
                    {{ $shippingAddress['address'] ?? '' }}<br>
                    {{ $shippingAddress['city'] ?? '' }}<br>
                    Tél : {{ $shippingAddress['phone'] ?? '' }}
                </div>
            </div>
            <div class="info-box">
                <div class="label">Mode de paiement</div>
                <div class="value" style="margin-bottom:10px;">
                    @if($order->payment_method === 'cod')
                        💵 Cash à la livraison
                    @elseif($order->payment_method === 'card')
                        💳 Carte bancaire
                    @else
                        📱 Paiement mobile
                    @endif
                </div>
                <div class="label">Statut</div>
                <div class="value">
                    <span class="payment-badge">✔ Confirmée</span>
                </div>
            </div>
        </div>

        <!-- Next Steps -->
        <div class="steps">
            <div class="steps-title">Prochaines étapes</div>
            <div class="step">
                <div class="step-num done">✔</div>
                <div class="step-content">
                    <strong>Commande reçue</strong>
                    <span>Nous avons bien enregistré votre commande.</span>
                </div>
            </div>
            <div class="step">
                <div class="step-num">2</div>
                <div class="step-content">
                    <strong>Traitement en cours (sous 24h)</strong>
                    <span>Notre équipe prépare soigneusement vos articles.</span>
                </div>
            </div>
            <div class="step">
                <div class="step-num">3</div>
                <div class="step-content">
                    <strong>Expédition (dans 1 à 2 jours)</strong>
                    <span>Vous serez notifié dès que votre colis est parti.</span>
                </div>
            </div>
            <div class="step">
                <div class="step-num">4</div>
                <div class="step-content">
                    <strong>Livraison (2 à 3 jours ouvrés)</strong>
                    <span>Votre commande arrive directement chez vous.</span>
                </div>
            </div>
        </div>

        <!-- CTA -->
        <div class="cta-section">
            <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/orders" class="cta-btn">
                Suivre ma commande
            </a>
        </div>

    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="brand-small">LUMA</div>
        <p>
            Casablanca, Maroc &bull; <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}">www.luma.ma</a><br><br>
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
            Pour toute question : <a href="mailto:support@luma.ma">support@luma.ma</a><br><br>
            &copy; {{ date('Y') }} LUMA. Tous droits réservés.
        </p>
    </div>

</div>
</body>
</html>
