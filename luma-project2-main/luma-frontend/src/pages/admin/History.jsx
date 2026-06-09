import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { Search, Calendar, DollarSign, ShoppingBag, Tag, Image, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function AdminHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchSalesHistory = () => {
    setTimeout(() => setLoading(true), 0);
    api.get('/admin/sales/history')
      .then(res => {
        setSales(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  // Filters & Search
  const filteredSales = sales.filter(item => {
    const productName = item.product?.name || '';
    const orderNumber = item.order?.order_number || '';
    const clientName = item.order?.user?.name || '';
    const clientEmail = item.order?.user?.email || '';

    const matchesSearch = 
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || (item.order && item.order.status === selectedStatus);

    return matchesSearch && matchesStatus;
  });

  // Calculate Stats
  const totalItemsSold = filteredSales.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRevenue = filteredSales.reduce((acc, curr) => acc + parseFloat(curr.total_price), 0);
  const totalOrdersCount = new Set(filteredSales.map(item => item.order_id)).size;
  const averagePricePerItem = totalItemsSold > 0 ? (totalRevenue / totalItemsSold) : 0;

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'confirmed':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'pending':
        return 'bg-stone-50 text-stone-700 border border-stone-100';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-100';
      default:
        return 'bg-stone-50 text-stone-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Livrée';
      case 'shipped': return 'Expédiée';
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status || 'Inconnu';
    }
  };

  return (
    <div className="min-h-full bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historique des Ventes</h1>
            <p className="text-gray-500 mt-1">Suivez et contrôlez tous les articles de luxe vendus et les transactions des clients.</p>
          </div>
          <button 
            onClick={fetchSalesHistory}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            Actualiser
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Revenu Total des Ventes</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalRevenue.toFixed(2)} MAD</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign size={22} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight size={14} className="mr-0.5" />
                En direct
              </span>
              <span className="text-gray-400 ml-1.5">gains de la boutique</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total des Articles Vendus</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalItemsSold} Unités</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <ShoppingBag size={22} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-blue-600 font-semibold flex items-center">
                Actif
              </span>
              <span className="text-gray-400 ml-1.5">produits expédiés/en attente</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Commandes Uniques</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalOrdersCount} Commandes</h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <TrendingUp size={22} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-purple-600 font-semibold">Traitées</span>
              <span className="text-gray-400 ml-1.5">paiements effectués</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valeur Moyenne des Articles</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{averagePricePerItem.toFixed(2)} MAD</h3>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 text-stone-600">
                <Tag size={22} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-stone-600 font-semibold">Moyenne</span>
              <span className="text-gray-400 ml-1.5">revenu par pièce vendue</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par produit, N° de commande ou nom de client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8956C]/20 focus:border-[#C8956C] transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#C8956C] focus:border-[#C8956C] block p-2.5 outline-none"
            >
              <option value="all">Tous les statuts de commande</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="shipped">Expédié</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Détails du produit</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Informations client</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">N° Commande & Statut</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Qté</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date de vente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#C8956C] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <ShoppingBag size={40} className="text-gray-300" />
                        <p className="text-sm font-medium">Aucune vente enregistrée avec ces critères.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Product details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                            {item.product?.image ? (
                              <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Image className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                          <div className="ml-4 max-w-xs">
                             <div className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || 'Produit inconnu'}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {item.variant ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <span>Taille : {item.variant.size}</span>
                                  {item.variant.color && (
                                    <>
                                      <span className="text-stone-300">•</span>
                                      <span className="flex items-center gap-1">
                                        Couleur : {item.variant.color}
                                        {item.variant.color_hex && (
                                          <span 
                                            className="w-2.5 h-2.5 rounded-full border border-stone-200" 
                                            style={{ backgroundColor: item.variant.color_hex }}
                                          />
                                        )}
                                      </span>
                                    </>
                                  )}
                                </span>
                              ) : (
                                'Aucun détail de variante'
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-955">{item.order?.user?.name || 'Client visiteur'}</div>
                        <div className="text-xs text-gray-400">{item.order?.user?.email || 'N/A'}</div>
                      </td>

                      {/* Order No & Status */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 tracking-tight">{item.order?.order_number || 'N/A'}</div>
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 inline-flex text-[10px] uppercase font-bold tracking-wider rounded-md ${getStatusBadge(item.order?.status)}`}>
                            {getStatusText(item.order?.status)}
                          </span>
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="px-6 py-4 text-center text-sm font-bold text-gray-800">
                        {item.quantity}
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {parseFloat(item.unit_price).toFixed(2)} MAD
                      </td>

                      {/* Total Price */}
                      <td className="px-6 py-4 text-sm font-bold text-gray-950">
                        {parseFloat(item.total_price).toFixed(2)} MAD
                      </td>

                      {/* Sale Date */}
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-gray-400" />
                          <span>
                            {new Date(item.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
            <span>Affichage de <span className="font-semibold text-gray-900">{filteredSales.length}</span> ventes</span>
          </div>
        </div>

      </div>
    </div>
  );
}
