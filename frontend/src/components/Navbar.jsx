import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Clock, LogOut, Store, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  dashboard: { title: 'Dashboard Ringkasan', subtitle: 'Pantau kinerja toko & statistik utama' },
  kasir: { title: 'Kasir / Transaksi POS', subtitle: 'Pilih barang, hitung kembalian & cetak struk' },
  barang: { title: 'Manajemen Data Barang', subtitle: 'Kelola katalog, harga beli/jual & stok minimum' },
  'barang-masuk': { title: 'Pencatatan Barang Masuk', subtitle: 'Restock kulakan barang & tambah stok otomatis' },
  stok: { title: 'Monitoring Stok Real-time', subtitle: 'Pantau ketersediaan barang & peringatan stok' },
  laporan: { title: 'Laporan Penjualan Harian', subtitle: 'Rekap transaksi, pendapatan omset & laba kotor' },
};

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
      setTimeStr(now.toLocaleDateString('id-ID', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentInfo = pageTitles[activeTab] || { title: 'ZaynZulfikarStore', subtitle: 'Sistem Kasir & Stok' };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-charcoal-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
      {/* Page Title / Mobile Logo */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-gold-600 to-amber-400 flex items-center justify-center text-charcoal-950 shadow-sm">
          <Store className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base lg:text-lg font-bold text-charcoal-900 leading-tight">
            {currentInfo.title}
          </h2>
          <p className="hidden sm:block text-xs text-charcoal-500 font-medium">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Barang Masuk Button (disembunyikan di menu kasir dan barang masuk) */}
        {activeTab !== 'barang-masuk' && activeTab !== 'kasir' && (
          <button
            onClick={() => setActiveTab('barang-masuk')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-100 hover:bg-gold-50 text-charcoal-800 hover:text-gold-700 hover:border-gold-300 border border-charcoal-200 text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-gold-600" />
            <span>Barang Masuk</span>
          </button>
        )}

        {/* Live Date/Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs font-medium text-charcoal-600">
          <Clock className="w-3.5 h-3.5 text-gold-600" />
          <span>{timeStr}</span>
        </div>

        {/* Store Open Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">Toko</span> Buka
        </div>

        {/* Mobile Logout Button */}
        <button
          onClick={logout}
          title="Keluar"
          className="lg:hidden p-2 rounded-xl text-charcoal-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
