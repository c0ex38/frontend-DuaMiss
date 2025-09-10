import { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import { ThemeContext } from '../contexts/ThemeContext';
import { SkeletonLoader } from '../components/LoadingComponents';
import Toast from './Toast';

// ProductCard component
const ProductCard = ({ product, onEdit, onDelete, loading }) => (
  <div className="flex items-start justify-between mb-4">
    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-sm">
        {product.name.charAt(0).toUpperCase()}
      </span>
    </div>
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={() => onEdit(product)}
        disabled={loading}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        title="Düzenle"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={() => onDelete(product.id)}
        disabled={loading}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Sil"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
);

function ProductPanel() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { isDark, accentColor } = useContext(ThemeContext);
  const { toast, showToast, hideToast, handleApiError } = useToast();
  
  // Debounce search for better performance
  const debouncedSearch = useDebounce(search, 300);

  // Memoized filtered products for better performance
  const filtered = useMemo(() => {
    if (!debouncedSearch) return products;
    const keyword = debouncedSearch.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(keyword) ||
      p.code?.toLowerCase().includes(keyword)
    );
  }, [products, debouncedSearch]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('products/');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      handleApiError(err, 'Ürünler alınamadı');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !price) {
      showToast('Tüm alanları doldurun', 'warning');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      showToast('Geçerli bir fiyat girin', 'warning');
      return;
    }

    try {
      setLoading(true);
      const productData = { 
        name: name.trim(), 
        code: code.trim(), 
        price: numericPrice 
      };

      if (editId) {
        await api.put(`products/${editId}/`, productData);
        showToast('Ürün güncellendi');
      } else {
        await api.post('products/', productData);
        showToast('Ürün eklendi');
      }

      setName('');
      setCode('');
      setPrice('');
      setEditId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      handleApiError(err, 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setName(product.name);
    setCode(product.code);
    setPrice(product.price.toString());
    setEditId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      await api.delete(`products/${id}/`);
      showToast('Ürün silindi');
      fetchProducts();
    } catch (err) {
      handleApiError(err, 'Silme işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setPrice('');
    setEditId(null);
    setShowForm(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <>
      <Toast toast={toast} hideToast={hideToast} />
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-4xl font-bold transition-colors ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Ürün Yönetimi
              </h1>
              <p className={`mt-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Ürünlerinizi ekleyin, düzenleyin ve yönetin
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-6 py-3 bg-gradient-to-r from-${accentColor}-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105`}
            >
              {showForm ? 'Listeyi Göster' : 'Ürün Ekle'}
            </button>
          </div>

          {/* Search */}
          {!showForm && (
            <div className="relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500'
                    : 'bg-white/90 border-gray-200 text-gray-800 placeholder-gray-500 focus:border-purple-500'
                }`}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-3xl shadow-2xl mb-8 ${
              isDark 
                ? 'bg-gray-800/80 backdrop-blur-xl border border-gray-700'
                : 'bg-white/90 backdrop-blur-xl border border-white/20'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {editId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            <form onSubmit={handleAddOrUpdate} className="grid md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Ürün Adı
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:border-purple-500'
                  }`}
                  placeholder="Ürün adını girin"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Ürün Kodu
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:border-purple-500'
                  }`}
                  placeholder="Ürün kodunu girin"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:border-purple-500'
                  }`}
                  placeholder="Fiyatı girin"
                />
              </div>
              <div className="md:col-span-3 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 bg-gradient-to-r from-${accentColor}-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                >
                  {loading ? 'İşleniyor...' : (editId ? 'Güncelle' : 'Ekle')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  İptal
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Product List */}
        {!showForm && (
          <div className="space-y-6">
            {loading ? (
              <SkeletonLoader type="grid" count={6} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <svg className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0v6h8V13M6 13l8-8 8 8" />
                  </svg>
                </div>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ürün bulunamadı
                </p>
                {debouncedSearch && (
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    "{debouncedSearch}" için arama sonucu yok
                  </p>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filtered.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 group ${
                        isDark 
                          ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50'
                          : 'bg-white/90 backdrop-blur-sm border border-white/20'
                      }`}
                    >
                      <ProductCard 
                        product={product} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                        loading={loading} 
                      />
                      
                      <div className="space-y-3 mt-4">
                        <div>
                          <h3 className={`font-bold text-lg mb-1 group-hover:text-purple-600 transition-colors ${
                            isDark ? 'text-white' : 'text-gray-800'
                          }`}>
                            {product.name}
                          </h3>
                          <p className={`text-sm font-medium ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Kod: {product.code}
                          </p>
                        </div>
                        
                        <div className={`flex items-center justify-between pt-3 border-t ${
                          isDark ? 'border-gray-700' : 'border-gray-100'
                        }`}>
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              ₺{parseFloat(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              Fiyat
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ProductPanel;
