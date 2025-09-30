import { useEffect, useState, useCallback, useMemo } from 'react';
import Select from 'react-select';
import api from '../api/axios';
import useToast from '../hooks/useToast';
import Toast from './Toast';

function OrderPanel() {
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [vatRate, setVatRate] = useState(0);
  const [items, setItems] = useState([
    { product: '', quantity: 1, unit_price: '', item_discount: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  const { toast, showToast, hideToast, handleApiError } = useToast();

  // Memoized options for better Select performance
  const companyOptions = useMemo(() => 
    companies.map((c) => ({
      value: c.id,
      label: c.name
    })), [companies]
  );

  const productOptions = useMemo(() => 
    products.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.code})`,
      price: p.price
    })), [products]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, prodRes, orderRes] = await Promise.all([
        api.get('companies/'),
        api.get('products/'),
        api.get('orders/'),
      ]);
      setCompanies(compRes.data);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      handleApiError(err, 'Veriler alınamadı');
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItemRow = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: '', item_discount: 0 }]);
  };

  const removeItemRow = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    
    if (newItems.length === 0) {
      newItems.push({ product: '', quantity: 1, unit_price: '', item_discount: 0 });
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      showToast('Lütfen bir firma seçin', 'warning');
      return;
    }

    const validItems = items.filter(item => item.product && item.quantity && item.unit_price);
    
    if (validItems.length === 0) {
      showToast('Lütfen en az bir ürün ekleyin', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      await api.post('orders/', {
        company: selectedCompany,
        global_discount: globalDiscount,
        vat_rate: vatRate,
        items: validItems,
      });
      
      showToast('Sipariş başarıyla oluşturuldu');
      
      setSelectedCompany('');
      setGlobalDiscount(0);
      setVatRate(0);
      setItems([{ product: '', quantity: 1, unit_price: '', item_discount: 0 }]);

      const updatedOrders = await api.get('orders/');
      setOrders(updatedOrders.data);
    } catch (err) {
      handleApiError(err, 'Sipariş oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  // ÖNEMLİ DEĞİŞİKLİK: handleItemChange'i optimize ettik
  const handleItemChange = useCallback((index, field, value) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      
      // Validate inputs to prevent negative values
      if ((field === 'quantity' || field === 'unit_price') && value < 0) {
        value = 0;
      }
      
      // Limit discount to 0-100 range
      if (field === 'item_discount' && (value < 0 || value > 100)) {
        value = value < 0 ? 0 : 100;
      }
      
      // Değeri güncelle - boş string kontrolü ekledik
      if (field === 'quantity' || field === 'item_discount') {
        newItems[index][field] = Number(value) || 0;
      } else if (field === 'unit_price') {
        newItems[index][field] = value === '' ? '' : Number(value);
      } else {
        newItems[index][field] = value;
      }
      
      // Auto-fill price when product is selected
      if (field === 'product' && value) {
        const selectedProduct = products.find(p => p.id === Number(value));
        if (selectedProduct) {
          newItems[index].unit_price = selectedProduct.price;
        }
      }
      
      // Son satırda ürün seçilirse yeni satır ekle
      if (field === 'product' && value && index === prevItems.length - 1) {
        setTimeout(() => addItemRow(), 0);
      }
      
      return newItems;
    });
  }, [products]);

  const handleGlobalDiscountChange = (value) => {
    const numValue = Number(value) || 0;
    const validValue = Math.min(Math.max(0, numValue), 100);
    setGlobalDiscount(validValue);
  };

  const handleVatRateChange = (value) => {
    const numValue = Number(value) || 0;
    const validValue = Math.max(0, numValue);
    setVatRate(validValue);
  };

  // ÖNEMLİ DEĞİŞİKLİK: useEffect yerine useMemo kullanarak hesaplama yaptık
  const calculations = useMemo(() => {
    let subtotal = 0;
    
    // Calculate subtotal and item discounts
    items.forEach(item => {
      // Skip calculation for items with missing values
      if (!item.product || !item.quantity || !item.unit_price) {
        return;
      }
      
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const discount = Number(item.item_discount) || 0;
      
      const itemTotal = Math.max(0, qty * price);
      const itemDiscountAmount = (itemTotal * Math.min(Math.max(0, discount), 100)) / 100;
      subtotal += Math.max(0, itemTotal - itemDiscountAmount);
    });

    // Calculate global discount (clamped between 0-100%)
    const safeGlobalDiscount = Math.min(Math.max(0, Number(globalDiscount) || 0), 100);
    const globalDiscountAmount = (subtotal * safeGlobalDiscount) / 100;
    const afterDiscount = Math.max(0, subtotal - globalDiscountAmount);

    // Calculate VAT (ensure non-negative)
    const safeVatRate = Math.max(0, Number(vatRate) || 0);
    const vatAmount = (afterDiscount * safeVatRate) / 100;

    // Calculate final total
    const total = afterDiscount + vatAmount;

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: globalDiscountAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2)
    };
  }, [items, globalDiscount, vatRate]);
  
  // React-Select özel stilleri
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '100%',
      height: 'auto',
    }),
    menu: (provided) => ({
      ...provided,
      width: 'auto',
      minWidth: '250%',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px',
    }),
    option: (provided) => ({
      ...provided,
      whiteSpace: 'nowrap',
      overflow: 'visible',
      textOverflow: 'clip',
      padding: '10px',
    }),
    singleValue: (provided) => ({
      ...provided,
      maxWidth: '100%',
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'clip',
      height: 'auto',
      lineHeight: '1.2',
    }),
    valueContainer: (provided) => ({
      ...provided,
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'clip',
      height: 'auto',
      flexWrap: 'wrap',
    }),
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg mb-4">
          <span className="text-2xl">🛒</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Sipariş Yönetimi
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Müşteri siparişlerini oluşturun, yönetin ve takip edin.
        </p>
        <div className="mt-4 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
          Toplam Sipariş: {orders.length}
        </div>
      </div>

      {/* Order Form */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          Yeni Sipariş Oluştur
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Firma Seçin</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <Select
                  options={companies.map((c) => ({
                    value: c.id,
                    label: c.name
                  }))}
                  value={companies.find((c) => c.id === Number(selectedCompany)) && {
                    value: selectedCompany,
                    label: companies.find((c) => c.id === Number(selectedCompany))?.name
                  }}
                  onChange={(selectedOption) => setSelectedCompany(selectedOption.value)}
                  placeholder="Firma seçin..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      paddingLeft: '2.5rem',
                      minHeight: '3.5rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(8px)',
                      borderColor: state.isFocused ? '#10b981' : '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: '#10b981'
                      }
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af'
                    })
                  }}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Genel İskonto (%)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={globalDiscount}
                  onChange={(e) => handleGlobalDiscountChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 placeholder-gray-400"
                  placeholder="İndirim oranı"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">KDV Oranı (%)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="number"
                  min="0"
                  value={vatRate}
                  onChange={(e) => handleVatRateChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 placeholder-gray-400"
                  placeholder="KDV oranı"
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                Ürünler
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Ürün Ekle
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="grid md:grid-cols-5 gap-4">
                    {/* Ürün Seçimi */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Ürün</label>
                      <Select
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.name} (${p.code})`
                        }))}
                        value={
                          products.find((p) => p.id === Number(item.product)) && {
                            value: item.product,
                            label: `${products.find((p) => p.id === Number(item.product))?.name} (${products.find((p) => p.id === Number(item.product))?.code})`
                          }
                        }
                        onChange={(selectedOption) =>
                          handleItemChange(index, 'product', selectedOption?.value)
                        }
                        placeholder="Ürün Seçin"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={customSelectStyles}
                      />
                    </div>

                    {/* Adet */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Adet</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                      />
                    </div>

                    {/* Birim Fiyat */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Birim Fiyat (₺)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                      />
                    </div>

                    {/* Ürün İskonto */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">İskonto (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.item_discount}
                        onChange={(e) => handleItemChange(index, 'item_discount', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                      />
                    </div>
                    
                    {/* Silme Butonu */}
                    <div className="flex items-end justify-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={items.length === 1}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          items.length === 1 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105'
                        }`}
                        title={items.length === 1 ? "En az bir ürün gerekli" : "Bu ürünü sil"}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                Sipariş Özeti
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium text-gray-800">₺{calculations.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İskonto ({globalDiscount}%):</span>
                  <span className="font-medium text-red-600">-₺{calculations.discountAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KDV ({vatRate}%):</span>
                  <span className="font-medium text-blue-600">₺{calculations.vatAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-emerald-200">
                  <span className="text-gray-800">Toplam:</span>
                  <span className="text-emerald-600">₺{calculations.total}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  loading ? 'opacity-75 cursor-not-allowed' : 'hover:from-emerald-700 hover:to-teal-700 hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Sipariş Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default OrderPanel;
