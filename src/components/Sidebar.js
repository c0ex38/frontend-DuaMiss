import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';

function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme, accentColor, setAccentColor } = useContext(ThemeContext);
  
  const menuItems = [
    { id: 'companies', icon: '🏢', label: 'Şirketler', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'products', icon: '📦', label: 'Ürünler', gradient: 'from-purple-500 to-pink-500' },
    { id: 'orders', icon: '🧾', label: 'Sipariş Fişi', gradient: 'from-green-500 to-teal-500' },
    { id: 'orderhistory', icon: '📋', label: 'Sipariş Geçmişi', gradient: 'from-orange-500 to-red-500' }
  ];

  const accentColors = [
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'purple', color: 'bg-purple-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'red', color: 'bg-red-500' },
    { name: 'yellow', color: 'bg-yellow-500' },
    { name: 'pink', color: 'bg-pink-500' }
  ];

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      navigate('/login', { replace: true });
    }
  };

  // Accent color gradient mapping - CRITICAL: Tailwind needs static classes
  const getAccentGradient = (color) => {
    const gradients = {
      blue: 'from-blue-500 to-purple-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-purple-600',
      red: 'from-red-500 to-purple-600',
      yellow: 'from-yellow-500 to-purple-600',
      pink: 'from-pink-500 to-purple-600',
      emerald: 'from-emerald-500 to-purple-600'
    };
    return gradients[color] || gradients.blue;
  };

  return (
    <div className={`fixed left-0 top-0 h-screen w-72 text-white flex flex-col shadow-2xl border-r transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50'
        : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/10'
    }`}>
      {/* Header */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-12 h-12 bg-gradient-to-br ${getAccentGradient(accentColor)} rounded-xl flex items-center justify-center shadow-lg`}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DuaMiss</h2>
            <p className="text-sm text-gray-400 font-medium">ERP System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full group relative flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-white/20 backdrop-blur-xl shadow-lg border border-white/20 text-white transform scale-105'
                : 'hover:bg-white/10 hover:backdrop-blur-xl hover:scale-105 text-gray-300 hover:text-white'
            }`}
          >
            {activeTab === item.id && (
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 rounded-2xl`}></div>
            )}
            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              activeTab === item.id 
                ? `bg-gradient-to-r ${item.gradient} shadow-lg` 
                : 'bg-white/10 group-hover:bg-white/20'
            }`}>
              <span className="text-xl">{item.icon}</span>
            </div>
            <span className="relative z-10 font-semibold text-sm">{item.label}</span>
            {activeTab === item.id && (
              <div className="absolute right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-white/10">
        {/* Theme Toggle */}
        <div className="mb-6">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300">
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </div>
            <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Accent Color Picker */}
          <div className="px-4 py-2">
            <p className="text-xs text-gray-400 mb-2">Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {accentColors.map((color) => (
                <motion.button
                  key={color.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAccentColor(color.name)}
                  className={`w-6 h-6 rounded-full ${color.color} border-2 transition-all duration-200 ${
                    accentColor === color.name ? 'border-white shadow-lg' : 'border-transparent hover:border-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-300 hover:text-white hover:bg-red-500/20 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 group-hover:bg-red-500/30 flex items-center justify-center transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
  