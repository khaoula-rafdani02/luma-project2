import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { Plus, Search, Edit2, Trash2, X, Image, Archive } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditStockOpen, setIsEditStockOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);

  // Add Product Form State
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    sale_price: '',
    gender: 'women',
    is_active: true,
    is_featured: false,
    image: '',
    stock: 10
  });

  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchProducts = () => {
    setTimeout(() => setLoading(true), 0);
    api.get('/admin/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const fetchCategories = () => {
    api.get('/categories').then(res => {
      setCategories(res.data);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Add Product Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    if (!form.category_id) {
      setFormError('Veuillez choisir une catégorie');
      setFormSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category_id', form.category_id);
      formData.append('description', form.description || '');
      formData.append('price', parseFloat(form.price));
      if (form.sale_price) {
        formData.append('sale_price', parseFloat(form.sale_price));
      }
      formData.append('gender', form.gender);
      formData.append('is_active', form.is_active ? '1' : '0');
      formData.append('is_featured', form.is_featured ? '1' : '0');
      formData.append('stock', parseInt(form.stock));

      if (form.image) {
        formData.append('image', form.image);
      }

      await api.post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsAddOpen(false);
      // Reset form
      setForm({
        name: '',
        category_id: '',
        description: '',
        price: '',
        sale_price: '',
        gender: 'women',
        is_active: true,
        is_featured: false,
        image: '',
        stock: 10
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setFormError("Erreur lors de l'ajout du produit. Veuillez vérifier les champs.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit Stock Submit
  const handleEditStock = (product) => {
    setEditingProduct(product);
    setNewStockVal(product.stock);
    setIsEditStockOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/products/${editingProduct.id}`, {
        stock: parseInt(newStockVal)
      });
      setIsEditStockOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification du stock.");
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // Filters
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchGender = selectedGender === 'all' ? true : p.gender === selectedGender;
    const matchCat = selectedCategory === 'all' ? true : p.category_id.toString() === selectedCategory;
    return matchSearch && matchGender && matchCat;
  });

  return (
    <div className="min-h-full bg-[#F8F9FA] p-8 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestion des Produits</h1>
            <p className="text-gray-500 mt-1">Gérez votre catalogue de luxe, les stocks, les descriptions et les prix.</p>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center px-5 py-3 bg-[#1A1A1A] hover:bg-[#C8956C] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Ajouter un produit
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher des produits..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8956C]/20 focus:border-[#C8956C] transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#C8956C] focus:border-[#C8956C] block p-2 outline-none"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select 
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#C8956C] focus:border-[#C8956C] block p-2 outline-none"
            >
              <option value="all">Tous les genres</option>
              <option value="women">Femme</option>
              <option value="kids">Enfant</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#C8956C] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Archive size={32} className="text-gray-300" />
                        <p className="text-sm">Aucun produit trouvé.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Image className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                          <div className="ml-4 max-w-xs">
                            <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-400 line-clamp-1">{product.description || 'Aucune description'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-stone-100 text-stone-700 uppercase tracking-wider">
                          {product.category?.name || 'Non classé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-600 font-medium capitalize">
                          {product.gender === 'women' ? 'Femme' : 'Enfant'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-950 font-bold">
                        {product.price} MAD
                        {product.sale_price && (
                          <div className="text-xs text-emerald-600 font-normal">Sale: {product.sale_price} MAD</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${product.stock > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {product.stock || 0} unités
                          </span>
                          <button 
                            onClick={() => handleEditStock(product)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800 transition-colors"
                            title="Modifier le stock"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Supprimer le produit"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
            <span>Affichage de <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produits</span>
          </div>
        </div>

      </div>

      {/* ADD PRODUCT MODAL/DRAWER */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-8 overflow-y-auto flex flex-col justify-between animate-slide-in">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                <h2 className="text-xl font-light uppercase tracking-widest text-[#1A1A1A]">Nouveau Produit</h2>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400 hover:text-stone-900">
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="mt-6 p-4 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 tracking-wide rounded">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="mt-8 space-y-5">
                
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Nom du produit</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="ex. Robe de Soirée Velours"
                    className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#C8956C] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Catégorie</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({...form, category_id: e.target.value})}
                      className="w-full border border-stone-200 px-3 py-3 rounded-lg text-sm focus:outline-none focus:border-[#C8956C] bg-white transition-colors"
                    >
                      <option value="">Choisir la catégorie</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Ligne de genre</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({...form, gender: e.target.value})}
                      className="w-full border border-stone-200 px-3 py-3 rounded-lg text-sm focus:outline-none focus:border-[#C8956C] bg-white transition-colors"
                    >
                      <option value="women">Femme</option>
                      <option value="kids">Enfant</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Description détaillée du produit..."
                    className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#C8956C] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Prix régulier (MAD)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value})}
                      placeholder="4500"
                      className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#C8956C] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Prix soldé (MAD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.sale_price}
                      onChange={(e) => setForm({...form, sale_price: e.target.value})}
                      placeholder="Optionnel"
                      className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#C8956C] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Stock Initial</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({...form, stock: e.target.value})}
                      placeholder="10"
                      className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#C8956C] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Image du produit</label>
                  
                  {/* File upload from PC */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-200 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Image className="w-8 h-8 mb-3 text-stone-400" />
                        <p className="mb-2 text-xs text-stone-500 font-semibold">Cliquer pour choisir un fichier</p>
                        <p className="text-[10px] text-stone-400">PNG, JPG, JPEG ou WEBP</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setForm({ ...form, image: file });
                          }
                        }}
                      />
                    </label>
                  </div>

                  {form.image && (
                    <div className="mt-3 relative w-full h-32 border border-stone-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                      <img 
                        src={form.image instanceof File ? URL.createObjectURL(form.image) : form.image} 
                        alt="Aperçu du produit" 
                        className="h-full object-contain"
                      />
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, image: ''})}
                        className="absolute top-2 right-2 bg-stone-900/80 hover:bg-stone-900 text-white p-1.5 rounded-full transition-colors"
                        title="Supprimer l'image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({...form, is_active: e.target.checked})}
                      className="accent-[#C8956C]"
                    />
                    <span className="text-xs text-stone-600 font-medium select-none">Actif sur le site</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({...form, is_featured: e.target.checked})}
                      className="accent-[#C8956C]"
                    />
                    <span className="text-xs text-stone-600 font-medium select-none">Produit vedette</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-[#1A1A1A] hover:bg-[#C8956C] text-white py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-lg disabled:bg-stone-300 disabled:text-stone-500 mt-6 shadow-md"
                >
                  {formSubmitting ? "Création..." : "Créer le produit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STOCK MODAL */}
      {isEditStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-fade-in mx-4">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1A1A1A]">Modifier le stock du produit</h3>
              <button onClick={() => { setIsEditStockOpen(false); setEditingProduct(null); }} className="text-stone-400 hover:text-stone-800 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-stone-500 mt-4">
              Modifier le stock de : <span className="font-semibold text-stone-800">{editingProduct?.name}</span>
            </p>

            <form onSubmit={handleStockSubmit} className="mt-6 space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Nouveau niveau de stock</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm text-center font-bold text-stone-900 focus:outline-none focus:border-[#C8956C] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#C8956C] text-white py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-lg shadow-md"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}