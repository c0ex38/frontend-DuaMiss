import { useEffect, useState } from 'react';
import api from '../api/axios';
import PDFPreviewModal from '../utils/pdfPreview';

function OrderHistoryPanel() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCompany, setSelectedCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, companiesRes] = await Promise.all([
          api.get('orders/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('companies/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const sortedOrders = ordersRes.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        setCompanies(companiesRes.data);
      } catch (err) {
        setError('Veriler alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter function
  useEffect(() => {
    let result = [...orders];

    if (selectedCompany) {
      result = result.filter(order => order.company === parseInt(selectedCompany));
    }

    if (startDate && endDate) {
      result = result.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(result);
  }, [orders, selectedCompany, startDate, endDate]);

  // Add new state for PDF preview
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Geçmiş Siparişler
        </span>
      </h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filtreler</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Firma</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tüm Firmalar</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Yükleniyor...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-sm">Sipariş bulunamadı.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setSelectedOrder(order);
                setIsModalOpen(true);
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {order.company_name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tarih: {order.created_at?.split('T')[0]}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-indigo-600 font-bold text-xl">
                    {order.total}₺
                  </div>
                  <div className="text-xs text-gray-500">
                    Ara Toplam: {order.subtotal}₺ | KDV: {order.vat_amount}₺ | İskonto: {order.discount_amount}₺
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Sipariş Detayı</h3>
              <div className="flex space-x-2">
                {selectedOrder && (
                  <button
                    onClick={() => setIsPdfPreviewOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Faturayı Görüntüle</span>
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Firma</p>
                  <p className="font-medium">{selectedOrder.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium">{selectedOrder.created_at?.split('T')[0]}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Ürünler</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} ({item.product_code}) × {item.quantity}</span>
                      <span className="font-medium">{(item.unit_price * item.quantity).toFixed(2)}₺</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam</span>
                  <span>{selectedOrder.subtotal}₺</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>İskonto</span>
                  <span>-{selectedOrder.discount_amount}₺</span>
                </div>
                <div className="flex justify-between text-sm text-blue-600">
                  <span>KDV</span>
                  <span>{selectedOrder.vat_amount}₺</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span>{selectedOrder.total}₺</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {isPdfPreviewOpen && selectedOrder && (
        <PDFPreviewModal 
          order={selectedOrder} 
          onClose={() => setIsPdfPreviewOpen(false)} 
        />
      )}
    </div>
  );
}

export default OrderHistoryPanel;