import { useState, useContext, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../contexts/ThemeContext';
import { SkeletonLoader } from '../components/LoadingComponents';

// Lazy load panels for better performance
const CompanyPanel = lazy(() => import('../components/CompanyPanel'));
const ProductPanel = lazy(() => import('../components/ProductPanel'));
const OrderPanel = lazy(() => import('../components/OrderPanel'));
const OrderHistoryPanel = lazy(() => import('../components/OrderHistoryPanel'));

function Dashboard() {
  const [activeTab, setActiveTab] = useState('companies');
  const { isDark, accentColor } = useContext(ThemeContext);

  const renderPanel = () => {
    const panels = {
      companies: CompanyPanel,
      products: ProductPanel,
      orders: OrderPanel,
      orderhistory: OrderHistoryPanel
    };

    const Component = panels[activeTab];
    
    return (
      <Suspense fallback={<SkeletonLoader type="panel" />}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Component />
        </motion.div>
      </Suspense>
    );
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-72 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-96 h-96 rounded-full filter blur-3xl transition-all duration-500 ${
            isDark 
              ? `bg-gradient-to-r from-${accentColor}-600/20 to-purple-600/20`
              : `bg-gradient-to-r from-${accentColor}-400/20 to-purple-500/20`
          }`}></div>
          <div className={`absolute bottom-20 left-20 w-80 h-80 rounded-full filter blur-3xl transition-all duration-500 ${
            isDark
              ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20'
              : 'bg-gradient-to-r from-purple-400/20 to-pink-500/20'
          }`}></div>
        </div>

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {renderPanel()}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
