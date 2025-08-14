import { useEffect, useState } from 'react';
import Select from 'react-select';
import api from '../api/axios';


function OrderPanel() {
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [vatRate, setVatRate] = useState(0); // Changed from 20 to 0
  const [items, setItems] = useState([
    { product: '', quantity: 1, unit_price: '', item_discount: 0 },
  ]);

  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchData = async () => {
      const [compRes, prodRes, orderRes] = await Promise.all([
        api.get('companies/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('products/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('orders/', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setCompanies(compRes.data);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
    };

    fetchData();
  }, []);

  const addItemRow = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: '', item_discount: 0 }]);
  };

  // Add a new function to remove an item
  const removeItemRow = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    
    // Make sure we always have at least one item row
    if (newItems.length === 0) {
      newItems.push({ product: '', quantity: 1, unit_price: '', item_discount: 0 });
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Boş ürün satırlarını filtrele
      const validItems = items.filter(item => item.product && item.quantity && item.unit_price);
      
      // En az bir geçerli ürün olup olmadığını kontrol et
      if (validItems.length === 0) {
        alert('Lütfen en az bir ürün ekleyin');
        return;
      }
      
      await api.post(
        'orders/',
        {
          company: selectedCompany,
          global_discount: globalDiscount,
          vat_rate: vatRate,
          items: validItems, // Sadece geçerli ürünleri gönder
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCompany('');
      setGlobalDiscount(0);
      setVatRate(0); // Changed from 20 to 0
      setItems([{ product: '', quantity: 1, unit_price: '', item_discount: 0 }]);

      const updatedOrders = await api.get('orders/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(updatedOrders.data);
    } catch (err) {
      alert('Sipariş oluşturulamadı');
    }
  };

  // Add new state for calculations
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    discountAmount: 0,
    vatAmount: 0,
    total: 0
  });

  // Improved handleItemChange function with validation
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    // Validate inputs to prevent negative values
    if ((field === 'quantity' || field === 'unit_price') && value < 0) {
      value = 0;
    }
    
    // Limit discount to 0-100 range
    if (field === 'item_discount' && (value < 0 || value > 100)) {
      value = value < 0 ? 0 : 100;
    }
    
    newItems[index][field] = field === 'quantity' || field === 'item_discount' ? Number(value) : value;
    setItems(newItems);
    
    // Eğer ürün seçildiyse ve son satırdaysa, otomatik olarak yeni satır ekle
    if (field === 'product' && value && index === items.length - 1) {
      addItemRow();
    }
  };

  // Add validation for global discount and VAT rate
  const handleGlobalDiscountChange = (value) => {
    // Ensure discount is between 0-100
    const validValue = Math.min(Math.max(0, value), 100);
    setGlobalDiscount(validValue);
  };

  const handleVatRateChange = (value) => {
    // Ensure VAT rate is not negative
    const validValue = Math.max(0, value);
    setVatRate(validValue);
  };

  // Improved calculation effect
  useEffect(() => {
    const calculateTotals = () => {
      let subtotal = 0;
      
      // Calculate subtotal and item discounts
      items.forEach(item => {
        // Skip calculation for items with missing values
        if (!item.product || !item.quantity || !item.unit_price) {
          return;
        }
        
        const itemTotal = Math.max(0, item.quantity * parseFloat(item.unit_price));
        const itemDiscountAmount = (itemTotal * Math.min(Math.max(0, item.item_discount), 100)) / 100;
        subtotal += Math.max(0, itemTotal - itemDiscountAmount);
      });
  
      // Calculate global discount (clamped between 0-100%)
      const safeGlobalDiscount = Math.min(Math.max(0, globalDiscount), 100);
      const globalDiscountAmount = (subtotal * safeGlobalDiscount) / 100;
      const afterDiscount = Math.max(0, subtotal - globalDiscountAmount);
  
      // Calculate VAT (ensure non-negative)
      const safeVatRate = Math.max(0, vatRate);
      const vatAmount = (afterDiscount * safeVatRate) / 100;
  
      // Calculate final total
      const total = afterDiscount + vatAmount;
  
      setCalculations({
        subtotal: subtotal.toFixed(2),
        discountAmount: globalDiscountAmount.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2)
      });
    };
  
    calculateTotals();
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
      minWidth: '250%', // Menüyü sağa doğru genişlet
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px',
    }),
    option: (provided) => ({
      ...provided,
      whiteSpace: 'nowrap', // Metni tek satırda tut
      overflow: 'visible', // Taşan içeriği göster
      textOverflow: 'clip', // Metni kırpma
      padding: '10px',
    }),
    singleValue: (provided) => ({
      ...provided,
      maxWidth: '100%',
      whiteSpace: 'normal', // Metni birden fazla satıra böl
      overflow: 'visible', // Taşan içeriği göster
      textOverflow: 'clip', // Metni kırpma
      height: 'auto', // Yüksekliği içeriğe göre ayarla
      lineHeight: '1.2', // Satır yüksekliğini azalt
    }),
    valueContainer: (provided) => ({
      ...provided,
      whiteSpace: 'normal', // Metni birden fazla satıra böl
      overflow: 'visible', // Taşan içeriği göster
      textOverflow: 'clip', // Metni kırpma
      height: 'auto', // Yüksekliği içeriğe göre ayarla
      flexWrap: 'wrap', // İçeriği sarma
    }),
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Sipariş Yönetimi
          </span>
        </h1>
        <div className="text-sm text-gray-500">
          Toplam Sipariş: {orders.length}
        </div>
      </div>

      {/* Sipariş Formu */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Yeni Sipariş Oluştur</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Firma</label>
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
                placeholder="Firma Seçin"
                className="react-select-container"
                classNamePrefix="react-select"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Genel İskonto (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={globalDiscount}
                  onChange={(e) => handleGlobalDiscountChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">KDV Oranı (%)</label>
                <input
                  type="number"
                  min="0"
                  value={vatRate}
                  onChange={(e) => handleVatRateChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">Ürünler</h3>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Yeni Ürün Ekle</span>
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-5 gap-4">
                    {/* Ürün Seçimi */}
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Ürün</label>
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
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Adet</label>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    </div>

                    {/* Birim Fiyat */}
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Birim Fiyat (₺)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    </div>

                    {/* Ürün İskonto */}
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Ürün İskonto (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.item_discount}
                        onChange={(e) => handleItemChange(index, 'item_discount', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    </div>
                    
                    {/* Silme Butonu */}
                    <div className="flex items-end justify-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={items.length === 1}
                        className={`p-2.5 rounded-lg transition ${
                          items.length === 1 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                        title={items.length === 1 ? "En az bir ürün gerekli" : "Bu ürünü sil"}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                </div>
                ))}
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium">{calculations.subtotal}₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İskonto ({globalDiscount}%):</span>
                  <span className="font-medium text-red-600">-{calculations.discountAmount}₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KDV ({vatRate}%):</span>
                  <span className="font-medium text-blue-600">{calculations.vatAmount}₺</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span className="text-gray-800">Toplam:</span>
                  <span className="text-indigo-600">{calculations.total}₺</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Siparişi Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderPanel;
