import { useEffect, useState } from 'react';
import api from '../api/axios';

function CompanyPanel() {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('access');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('companies/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data);
      setFiltered(res.data);
    } catch (err) {
      showToast('Şirketler alınamadı', 'error');
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editId) {
        await api.put(
          `companies/${editId}/`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast('Şirket güncellendi');
      } else {
        await api.post(
          'companies/',
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast('Şirket eklendi');
      }

      setName('');
      setEditId(null);
      fetchCompanies();
    } catch (err) {
      showToast('İşlem başarısız', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`companies/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Şirket silindi');
      fetchCompanies();
    } catch (err) {
      showToast('Silme işlemi başarısız', 'error');
    }
  };

  const handleEdit = (company) => {
    setEditId(company.id);
    setName(company.name);
  };

  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearch(keyword);
    const filteredResults = companies.filter((c) =>
      c.name.toLowerCase().includes(keyword.toLowerCase())
    );
    setFiltered(filteredResults);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <span className="text-yellow-500">🏢</span> Şirket Yönetimi
        </h1>
      </div>

      {/* Arama ve Ekleme Alanı */}
      <form onSubmit={handleAddOrUpdate} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            className="p-3 border rounded-lg"
            placeholder="Şirket Ara..."
            value={search}
            onChange={handleSearch}
          />
          <input
            className="p-3 border rounded-lg"
            placeholder="Şirket Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-700 transition"
          >
            {editId ? 'Güncelle' : '+ Şirket Ekle'}
          </button>
        </div>
      </form>

      {/* Liste */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="text-gray-500">Gösterilecek şirket yok.</p>
        ) : (
          filtered.map((company) => (
            <div
              key={company.id}
              className="bg-white shadow-md p-5 rounded-xl flex justify-between items-center hover:shadow-lg transition"
            >
              <span className="font-semibold text-gray-800">{company.name}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(company)}
                  className="text-sm px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
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

export default CompanyPanel;
