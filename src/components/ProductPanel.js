import { useEffect, useState } from 'react';
import api from '../api/axios';

function ProductPanel() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('access');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('products/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
      setFiltered(res.data);
    } catch (err) {
      showToast('Ürünler alınamadı', 'error');
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!name || !code || !price) return;

    try {
      if (editId) {
        await api.put(
          `products/${editId}/`,
          { name, code, price },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast('Ürün güncellendi');
      } else {
        await api.post(
          'products/',
          { name, code, price },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast('Ürün eklendi');
      }

      setName('');
      setCode('');
      setPrice('');
      setEditId(null);
      fetchProducts();
    } catch (err) {
      showToast('Hata oluştu', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`products/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Ürün silindi');
      fetchProducts();
    } catch (err) {
      showToast('Silinemedi', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setName(product.name);
    setCode(product.code);
    setPrice(product.price);
  };

  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearch(keyword);
    const results = products.filter((p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.code.toLowerCase().includes(keyword.toLowerCase())
    );
    setFiltered(results);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">📦 Ürün Yönetimi</h1>

      {/* Form ve Arama */}
      <form onSubmit={handleAddOrUpdate} className="grid md:grid-cols-4 gap-4">
        <input
          className="p-3 border rounded-lg"
          placeholder="Ürün Adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="p-3 border rounded-lg"
          placeholder="Ürün Kodu"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          type="number"
          className="p-3 border rounded-lg"
          placeholder="Fiyat"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-700 transition"
        >
          {editId ? 'Güncelle' : '+ Ürün Ekle'}
        </button>
      </form>

      <input
        className="p-3 border rounded-lg w-full"
        placeholder="Ürün adı veya kodu ile ara..."
        value={search}
        onChange={handleSearch}
      />

      {/* Liste */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="text-gray-500">Gösterilecek ürün yok.</p>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md p-5 rounded-xl flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <h2 className="font-semibold text-gray-800">{product.name}</h2>
                <p className="text-sm text-gray-500">Kodu: {product.code}</p>
                <p className="text-sm text-gray-500">Fiyat: {product.price}₺</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-sm px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ProductPanel;
