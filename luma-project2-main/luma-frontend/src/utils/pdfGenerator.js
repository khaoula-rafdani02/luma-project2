import html2pdf from 'html2pdf.js';

const getStatusText = (status) => {
  switch (status) {
    case 'delivered': return 'Livrée';
    case 'shipped': return 'En cours d’expédition';
    case 'processing': return 'En préparation';
    case 'cancelled': return 'Annulée';
    default: return 'En attente de validation';
  }
};

const getPaymentMethodText = (method) => {
  switch (method) {
    case 'cod': return 'Paiement à la livraison';
    case 'card': return 'Carte bancaire';
    default: return 'Paiement mobile';
  }
};

/**
 * Downloads the aesthetic store ticket/receipt as a PDF
 */
export const downloadTicketPDF = (order) => {
  const element = document.createElement('div');
  
  const itemsHtml = (order.items || []).map(item => {
    const prodName = item.product?.name || 'Article';
    const qty = item.quantity || 1;
    const totalPrice = parseFloat(item.total_price || 0).toFixed(2);
    
    let variantText = '';
    if (item.variant) {
      const sizeStr = item.variant.size ? item.variant.size.toUpperCase() : '';
      const colorStr = item.variant.color ? ` / Col: ${item.variant.color.toUpperCase()}` : '';
      variantText = `<div style="font-size: 8px; color: #555; margin-top: 2px;">Taille: ${sizeStr}${colorStr}</div>`;
    }
    
    return `
      <tr>
        <td style="padding: 6px 0; vertical-align: top; text-align: left;">
          <div style="font-weight: bold; font-size: 10px; color: #000;">${prodName}</div>
          ${variantText}
        </td>
        <td style="padding: 6px 0; text-align: center; vertical-align: top; font-size: 10px; color: #000;">${qty}</td>
        <td style="padding: 6px 0; text-align: right; vertical-align: top; font-size: 10px; color: #000;">${totalPrice} MAD</td>
      </tr>
    `;
  }).join('');

  element.innerHTML = `
    <div style="padding: 24px; font-family: 'Courier New', Courier, monospace; color: #000; width: 340px; background-color: #fff; margin: 0 auto; box-sizing: border-box; line-height: 1.4;">
      <div style="text-align: center; margin-bottom: 12px;">
        <h2 style="font-size: 20px; font-weight: bold; letter-spacing: 4px; margin: 0 0 4px 0;">LUMA</h2>
        <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin: 2px 0; font-weight: bold;">Haute Couture & Prêt-à-porter</p>
        <p style="font-size: 8px; color: #555; margin: 2px 0;">Casablanca, Maroc • www.luma.ma</p>
      </div>
      
      <div style="border-top: 1px dashed #000; margin: 12px 0;"></div>
      
      <div style="font-size: 10px; margin-bottom: 12px;">
        <p style="margin: 3px 0;"><strong>TICKET N°:</strong> #${order.id.toString().padStart(5, '0')}</p>
        <p style="margin: 3px 0;"><strong>DATE:</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')} ${new Date(order.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
        <p style="margin: 3px 0;"><strong>CLIENT:</strong> ${order.shipping_address?.name || 'N/A'}</p>
        <p style="margin: 3px 0;"><strong>TEL:</strong> ${order.shipping_address?.phone || ''}</p>
        <p style="margin: 3px 0; word-break: break-all;"><strong>ADRESSE:</strong> ${order.shipping_address?.address || ''}, ${order.shipping_address?.city || ''}</p>
      </div>
      
      <div style="border-top: 1px dashed #000; margin: 12px 0;"></div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border-bottom: 1px dashed #000; text-align: left; padding: 4px 0; font-size: 10px; font-weight: bold; width: 55%;">ARTICLE</th>
            <th style="border-bottom: 1px dashed #000; text-align: center; padding: 4px 0; font-size: 10px; font-weight: bold; width: 15%;">QTÉ</th>
            <th style="border-bottom: 1px dashed #000; text-align: right; padding: 4px 0; font-size: 10px; font-weight: bold; width: 30%;">PRIX</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="border-top: 1px dashed #000; margin: 12px 0;"></div>
      
      <div style="font-size: 10px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 2px 0; text-align: left;">SOUS-TOTAL</td>
            <td style="text-align: right; padding: 2px 0;">${parseFloat(order.subtotal || 0).toFixed(2)} MAD</td>
          </tr>
          <tr>
            <td style="padding: 2px 0; text-align: left;">LIVRAISON</td>
            <td style="text-align: right; padding: 2px 0;">${parseFloat(order.shipping_cost || 0) > 0 ? parseFloat(order.shipping_cost).toFixed(2) + ' MAD' : 'GRATUITE'}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 12px;">
            <td style="padding: 6px 0; border-top: 1px dashed #000; text-align: left;">TOTAL</td>
            <td style="text-align: right; padding: 6px 0; border-top: 1px dashed #000;">${parseFloat(order.total || 0).toFixed(2)} MAD</td>
          </tr>
        </table>
      </div>
      
      <div style="border-top: 1px dashed #000; margin: 12px 0;"></div>
      
      <div style="font-size: 9px;">
        <p style="margin: 3px 0;"><strong>PAIEMENT:</strong> ${getPaymentMethodText(order.payment_method)}</p>
        <p style="margin: 3px 0;"><strong>STATUT:</strong> ${getStatusText(order.status).toUpperCase()}</p>
      </div>
      
      <div style="border-top: 1px dashed #000; margin: 12px 0;"></div>
      
      <div style="text-align: center; margin-top: 16px; font-size: 9px;">
        <p style="margin: 2px 0; font-weight: bold;">MERCI POUR VOTRE CONFIANCE !</p>
        <p style="margin: 2px 0;">À BIENTÔT CHEZ LUMA</p>
        <div style="margin-top: 8px; letter-spacing: 3px; font-family: monospace; font-size: 11px; font-weight: bold;">
          *${order.id.toString().padStart(5, '0')}*
        </div>
      </div>
    </div>
  `;

  // We set a height based on items to avoid empty white space
  const itemsCount = order.items?.length || 1;
  const estimatedHeight = Math.max(7.5, 5.5 + itemsCount * 0.5);

  const opt = {
    margin:       0.15,
    filename:     `LUMA_Ticket_${order.id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: [3.8, estimatedHeight], orientation: 'portrait' }
  };
  
  return html2pdf().set(opt).from(element).save();
};

/**
 * Downloads the formal order invoice as a PDF
 */
export const downloadOrderPDF = (order) => {
  const element = document.createElement('div');
  
  const itemsHtml = (order.items || []).map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 0; text-align: left;">
        <div style="font-weight: 600; color: #111;">${item.product?.name || 'Article'}</div>
        ${item.variant ? `
          <div style="font-size: 10px; color: #666; margin-top: 2px;">
            Taille: ${item.variant.size ? item.variant.size.toUpperCase() : ''} 
            ${item.variant.color ? ` | Couleur: ${item.variant.color.toUpperCase()}` : ''}
          </div>
        ` : ''}
      </td>
      <td style="padding: 12px 0; text-align: center; color: #666;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; color: #666;">${parseFloat(item.unit_price || 0).toFixed(2)} MAD</td>
      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #111;">${parseFloat(item.total_price || 0).toFixed(2)} MAD</td>
    </tr>
  `).join('');

  element.innerHTML = `
    <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; max-width: 800px; margin: 0 auto; background-color: #fff;">
      <!-- Header -->
      <table style="width: 100%; margin-bottom: 40px; border-collapse: collapse;">
        <tr>
          <td style="text-align: left; vertical-align: top;">
            <h1 style="font-size: 28px; font-weight: 300; letter-spacing: 6px; margin: 0; color: #111;">LUMA</h1>
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 5px 0 0 0;">Haute Couture & Prêt-à-porter</p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <h2 style="font-size: 16px; font-weight: 600; text-transform: uppercase; tracking-wider; margin: 0; color: #C8956C;">Facture</h2>
            <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">N° #${order.id.toString().padStart(5, '0')}</p>
          </td>
        </tr>
      </table>

      <!-- Info section -->
      <table style="width: 100%; margin-bottom: 40px; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; text-align: left; vertical-align: top; font-size: 12px; line-height: 1.5; padding-right: 20px;">
            <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 10px 0; font-weight: bold;">Adresse de facturation / Livraison</h3>
            <p style="margin: 0; font-weight: 600; color: #111;">${order.shipping_address?.name || 'Client Luma'}</p>
            <p style="margin: 3px 0 0 0; color: #555;">${order.shipping_address?.address || ''}</p>
            <p style="margin: 3px 0 0 0; color: #555;">${order.shipping_address?.city || ''}</p>
            <p style="margin: 3px 0 0 0; color: #555;">Tél: ${order.shipping_address?.phone || ''}</p>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: top; font-size: 12px; line-height: 1.5;">
            <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 10px 0; font-weight: bold;">Détails de la facture</h3>
            <p style="margin: 0; color: #555;"><strong>Date de commande:</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
            <p style="margin: 3px 0 0 0; color: #555;"><strong>Mode de paiement:</strong> ${getPaymentMethodText(order.payment_method)}</p>
            <p style="margin: 3px 0 0 0; color: #555;"><strong>Statut de commande:</strong> ${getStatusText(order.status)}</p>
          </td>
        </tr>
      </table>

      <!-- Items list -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 2px solid #111; font-weight: bold;">
            <th style="padding: 10px 0; text-align: left; color: #111; width: 45%;">Description</th>
            <th style="padding: 10px 0; text-align: center; color: #111; width: 10%;">Qté</th>
            <th style="padding: 10px 0; text-align: right; color: #111; width: 20%;">Prix unitaire</th>
            <th style="padding: 10px 0; text-align: right; color: #111; width: 25%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Summary -->
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px;">
        <tr>
          <td style="width: 60%;"></td>
          <td style="width: 40%; text-align: right;">
            <table style="width: 100%; border-collapse: collapse; line-height: 2;">
              <tr>
                <td style="text-align: left; color: #666;">Sous-total</td>
                <td style="text-align: right; color: #111;">${parseFloat(order.subtotal || 0).toFixed(2)} MAD</td>
              </tr>
              <tr>
                <td style="text-align: left; color: #666;">Livraison</td>
                <td style="text-align: right; color: #111;">${parseFloat(order.shipping_cost || 0) > 0 ? parseFloat(order.shipping_cost).toFixed(2) + ' MAD' : 'GRATUITE'}</td>
              </tr>
              <tr style="font-size: 16px; font-weight: bold; border-top: 1px solid #111;">
                <td style="text-align: left; color: #111; padding-top: 10px;">Total</td>
                <td style="text-align: right; color: #C8956C; padding-top: 10px;">${parseFloat(order.total || 0).toFixed(2)} MAD</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <div style="margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 10px; color: #999; line-height: 1.5;">
        <p style="margin: 0; font-weight: bold; color: #555; text-transform: uppercase; letter-spacing: 1px;">Luma Haute Couture</p>
        <p style="margin: 3px 0 0 0;">Siège social: Boulevard d'Anfa, Casablanca, Maroc • Contact: boutique@luma.ma</p>
        <p style="margin: 10px 0 0 0; color: #bbb;">Merci pour votre achat. Cette facture sert de preuve officielle d'achat.</p>
      </div>
    </div>
  `;

  const opt = {
    margin:       0.4,
    filename:     `LUMA_Facture_${order.id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  
  return html2pdf().set(opt).from(element).save();
};
