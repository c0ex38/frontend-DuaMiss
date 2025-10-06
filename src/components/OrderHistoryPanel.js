import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';
import PDFPreviewModal from '../utils/pdfPreview';
import useToast from '../hooks/useToast';
import Toast from './Toast';

function OrderHistoryPanel() {
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCompany, setSelectedCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  const { handleApiError } = useToast();

  // Memoized filtered orders for better performance
  const filteredOrders = useMemo(() => {
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

    return result;
  }, [orders, selectedCompany, startDate, endDate]);

  const fetchData = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const [ordersRes, companiesRes] = await Promise.all([
        api.get('orders/'),
        api.get('companies/')
      ]);
      
      if (isMounted) {
        const sortedOrders = ordersRes.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setOrders(sortedOrders);
        setCompanies(companiesRes.data);
      }
    } catch (err) {
      if (isMounted) {
        handleApiError(err, 'Veriler alınırken bir hata oluştu');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    return () => { isMounted = false; };
  }, [handleApiError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Sipariş Geçmişi
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Geçmiş siparişlerinizi görüntüleyin, filtreleyin ve PDF olarak indirin.
        </p>
        <div className="mt-4 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
          Toplam {filteredOrders.length} sipariş
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
          Filtreler
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Firma Seçin</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">Tüm firmalar</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Başlangıç Tarihi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bitiş Tarihi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Sipariş Listesi
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Siparişler yükleniyor...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {selectedCompany || startDate || endDate ? 'Sipariş Bulunamadı' : 'Henüz Sipariş Yok'}
            </h3>
            <p className="text-gray-600">
              {selectedCompany || startDate || endDate 
                ? 'Filtrelere uygun sipariş bulunamadı.' 
                : 'Henüz sipariş oluşturulmamış.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        #{order.id}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {order.company_name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          {new Date(order.created_at).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.items?.length || 0} ürün
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₺{parseFloat(order.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-500">
                        Toplam Tutar
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setIsPdfPreviewOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="PDF Önizleme"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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