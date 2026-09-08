import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataBarang from './pages/DataBarang';
import BarangMasuk from './pages/BarangMasuk';
import Kasir from './pages/Kasir';
import Stok from './pages/Stok';
import Laporan from './pages/Laporan';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Navbar from './components/Navbar';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-base font-bold text-gold-400">ZaynZulfikarStore</h2>
        <p className="text-xs text-charcoal-400 mt-1">Menyiapkan sistem operasional...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Laptop / Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'kasir' && <Kasir />}
          {activeTab === 'barang' && <DataBarang />}
          {activeTab === 'barang-masuk' && <BarangMasuk />}
          {activeTab === 'stok' && <Stok setActiveTab={setActiveTab} />}
          {activeTab === 'laporan' && <Laporan />}
        </main>

        {/* Mobile / HP Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
