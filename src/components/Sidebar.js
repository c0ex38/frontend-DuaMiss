function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'companies', icon: '🏢', label: 'Şirketler' },
    { id: 'products', icon: '📦', label: 'Ürünler' },
    { id: 'orders', icon: '🧾', label: 'Sipariş Fişi' },
    { id: 'orderhistory', icon: '📋', label: 'Sipariş Geçmişi' }
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-indigo-700 text-white flex flex-col py-8 px-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-10">
        <h2 className="text-2xl font-bold">DuaMiss ERP</h2>
      </div>

      <nav className="space-y-2 flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-white text-indigo-700 font-semibold shadow-md'
                : 'hover:bg-indigo-600 hover:translate-x-1'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
        }}
        className="mt-auto flex items-center space-x-2 text-sm text-red-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-indigo-800"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Çıkış Yap</span>
      </button>
    </div>
  );
}

export default Sidebar;
  