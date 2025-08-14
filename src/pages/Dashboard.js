import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import CompanyPanel from '../components/CompanyPanel';
import ProductPanel from '../components/ProductPanel';
import OrderPanel from '../components/OrderPanel';
import OrderHistoryPanel from '../components/OrderHistoryPanel';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('companies');

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 p-8">
        <div className="container mx-auto">
          {activeTab === 'companies' && <CompanyPanel />}
          {activeTab === 'products' && <ProductPanel />}
          {activeTab === 'orders' && <OrderPanel />}
          {activeTab === 'orderhistory' && <OrderHistoryPanel />}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
