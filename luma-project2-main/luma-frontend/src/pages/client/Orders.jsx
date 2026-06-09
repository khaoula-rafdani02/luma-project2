import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import { ShoppingBag, Calendar, ChevronRight, Package, MapPin, Truck, Download, Printer, FileText } from 'lucide-react';
import { downloadTicketPDF, downloadOrderPDF } from '../../utils/pdfGenerator';

export default function ClientOrders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (token) {
      api.get('/client/orders')
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [token]);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return { text: 'Livrée', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
      case 'shipped': return { text: 'En cours d’expédition', color: 'text-purple-700 bg-purple-50 border-purple-100' };
      case 'processing': return { text: 'En préparation', color: 'text-blue-700 bg-blue-50 border-blue-100' };
      case 'cancelled': return { text: 'Annulée', color: 'text-red-700 bg-red-50 border-red-100' };
      default: return { text: 'En attente de validation', color: 'text-orange-700 bg-orange-50 border-orange-100' };
    }
  };


  const handlePrintOrder = (order) => {
    const itemsHtml = (order.items || []).map(item => {
      const prodName = item.product?.name || 'Article';
      const qty = item.quantity || 1;
      const totalPrice = parseFloat(item.total_price || 0).toFixed(2);
      
      let variantText = '';
      if (item.variant) {
        const sizeStr = item.variant.size ? item.variant.size.toUpperCase() : '';
        const colorStr = item.variant.color ? ` / Col: ${item.variant.color.toUpperCase()}` : '';
        variantText = `<div style="font-size: 10px; color: #555;">Taille: ${sizeStr}${colorStr}</div>`;
      }
      
      return `
        <tr>
          <td>
            <div class="font-bold">${prodName}</div>
            ${variantText}
          </td>
          <td style="text-align: center;">${qty}</td>
          <td style="text-align: right;">${totalPrice} MAD</td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de Commande #${order.id}</title>
          <style>
            @media print {
              @page {
                size: portrait;
                margin: 0;
              }
              body {
                margin: 1.5cm;
              }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              color: #000;
              max-width: 450px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.4;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .logo { font-size: 24px; font-weight: 300; letter-spacing: 5px; margin: 10px 0; }
            .divider { border-top: 1px dashed #000; margin: 15px 0; }
            .ticket-details { font-size: 12px; margin-bottom: 15px; }
            .ticket-details p { margin: 3px 0; }
            .items-table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .items-table th { border-bottom: 1px dashed #000; text-align: left; padding: 5px 0; }
            .items-table td { padding: 6px 0; }
            .total-section { font-size: 13px; margin-top: 10px; }
            .total-section table { width: 100%; }
            .total-row { font-size: 15px; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 10px; color: #555; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="logo">LUMA</div>
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 2px 0;">Haute Couture & Prêt-à-porter</p>
            <p style="font-size: 10px; color: #555; margin: 2px 0;">Casablanca, Maroc • www.luma.ma</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="ticket-details">
            <p><strong>TICKET N°:</strong> #${order.id.toString().padStart(5, '0')}</p>
            <p><strong>DATE:</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')} ${new Date(order.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
            <p><strong>CLIENT:</strong> ${order.shipping_address?.name || 'N/A'}</p>
            <p><strong>TEL:</strong> ${order.shipping_address?.phone || ''}</p>
            <p><strong>ADRESSE:</strong> ${order.shipping_address?.address || ''}, ${order.shipping_address?.city || ''}</p>
          </div>
          
          <div class="divider"></div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 55%;">ARTICLE</th>
                <th style="width: 15%; text-align: center;">QTÉ</th>
                <th style="width: 30%; text-align: right;">PRIX</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div class="total-section">
            <table>
              <tr>
                <td>SOUS-TOTAL</td>
                <td class="text-right">${parseFloat(order.subtotal || 0).toFixed(2)} MAD</td>
              </tr>
              <tr>
                <td>LIVRAISON</td>
                <td class="text-right">${parseFloat(order.shipping_cost || 0) > 0 ? parseFloat(order.shipping_cost).toFixed(2) + ' MAD' : 'GRATUITE'}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL</td>
                <td class="text-right">${parseFloat(order.total || 0).toFixed(2)} MAD</td>
              </tr>
            </table>
          </div>
          
          <div class="divider"></div>
          
          <div class="ticket-details">
            <p><strong>PAIEMENT:</strong> ${order.payment_method === 'cod' ? 'CASH À LA LIVRAISON' : order.payment_method === 'card' ? 'CARTE BANCAIRE' : 'PAIEMENT MOBILE'}</p>
            <p><strong>STATUT:</strong> ${order.status === 'delivered' ? 'LIVRÉE' : order.status === 'shipped' ? 'EXPÉDIÉE' : order.status === 'processing' ? 'EN COURS' : 'EN ATTENTE'}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-center footer">
            <p>MERCI POUR VOTRE CONFIANCE !</p>
            <p>À BIENTÔT CHEZ LUMA</p>
            <div style="margin-top: 15px; letter-spacing: 3px; font-family: monospace; font-size: 14px;">
              *${order.id.toString().padStart(5, '0')}*
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-[#C8956C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light uppercase tracking-widest text-[#1A1A1A]">Mes Commandes</h1>
        <p className="text-xs text-gray-400 mt-1">Consultez l'historique et suivez le statut de vos commandes Luma.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#FCFCFA] border border-[#F3F2EE] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <ShoppingBag size={40} className="text-stone-300" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-800">Aucune commande passée</h3>
          <p className="text-xs text-stone-400 max-w-sm">Vous n'avez pas encore passé de commande sur notre boutique. Explorez nos collections couture pour y dénicher vos pièces préférées.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusLabel(order.status);
            const isExpanded = expandedOrderId === order.id;

            return (
              <div 
                key={order.id} 
                className="bg-[#FCFCFA] border border-[#F3F2EE] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-sm"
              >
                {/* Main Header summary block */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">Commande #{order.id.toString().padStart(5, '0')}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400 font-medium">
                        <Calendar size={12} />
                        <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span>{order.items?.length || 0} article(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${status.color}`}>
                      {status.text}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-950">{order.total} MAD</span>
                      <ChevronRight 
                        size={18} 
                        className={`text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-[#C8956C]' : ''}`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="border-t border-[#F3F2EE] bg-[#FDFDFD] p-6 space-y-6 animate-fade-in">
                    
                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Articles Commandés</h4>
                      <div className="border border-stone-100 rounded-xl divide-y divide-stone-100 bg-white">
                        {order.items?.map((item) => (
                          <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-stone-50 rounded-lg overflow-hidden border border-stone-100 flex-shrink-0 flex items-center justify-center">
                                {item.product?.image ? (
                                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <ShoppingBag className="w-5 h-5 text-stone-300" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-stone-900 line-clamp-1">{item.product?.name}</p>
                                <p className="text-[10px] text-stone-400 font-medium mt-0.5">Quantité : {item.quantity} • {item.unit_price} MAD / unité</p>
                              </div>
                            </div>
                            <p className="font-bold text-stone-950">{item.total_price} MAD</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
                      {/* Shipping Address */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold flex items-center gap-1.5">
                          <MapPin size={12} className="text-[#C8956C]" />
                          Adresse de Livraison
                        </h4>
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100/50">
                          <p className="font-bold text-stone-800">
                            {order.shipping_address?.name}
                          </p>
                          <p className="text-stone-500 mt-1">
                            {order.shipping_address?.address}, {order.shipping_address?.city}
                          </p>
                          <p className="text-stone-500 mt-0.5">Tél : {order.shipping_address?.phone}</p>
                        </div>
                      </div>

                      {/* Payment Method / Summary */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold flex items-center gap-1.5">
                          <Truck size={12} className="text-[#C8956C]" />
                          Récapitulatif Financier
                        </h4>
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100/50 space-y-2">
                          <div className="flex justify-between text-stone-500">
                            <span>Mode de paiement</span>
                            <span className="font-semibold text-stone-700 uppercase">
                              {order.payment_method === 'cod' ? 'Paiement à la livraison' : order.payment_method}
                            </span>
                          </div>
                          <div className="h-[1px] bg-stone-200/50 my-2"></div>
                          <div className="flex justify-between text-stone-500">
                            <span>Sous-total</span>
                            <span>{order.subtotal} MAD</span>
                          </div>
                          <div className="flex justify-between text-stone-500">
                            <span>Frais de livraison</span>
                            <span>{order.shipping_cost} MAD</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200/50">
                            <span>Montant Total</span>
                            <span>{order.total} MAD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex flex-wrap justify-end gap-3">
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="flex items-center gap-2 bg-[#C8956C] hover:bg-[#B07D55] text-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-xl shadow-md shadow-[#C8956C]/10"
                      >
                        <Printer size={14} />
                        Imprimer le ticket
                      </button>
                      <button
                        onClick={() => downloadTicketPDF(order)}
                        className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#C8956C] text-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-xl shadow-md"
                      >
                        <Download size={14} />
                        Télécharger le ticket (PDF)
                      </button>
                      <button
                        onClick={() => downloadOrderPDF(order)}
                        className="flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-stone-800 px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-xl"
                      >
                        <FileText size={14} />
                        Télécharger la facture (PDF)
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}