import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  PlusCircle, 
  Boxes,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export const Dashboard = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-charcoal-500">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Produk',
      value: data?.total_produk || 0,
      unit: 'Item Terdaftar',
      icon: Package,
      gradient: 'from-charcoal-900 to-charcoal-800',
      iconBg: 'bg-gold-500/20 text-gold-400 border border-gold-500/30',
      onClick: () => setActiveTab('barang')
    },
    {
      title: 'Transaksi Hari Ini',
      value: data?.transaksi_hari_ini || 0,
      unit: 'Nota Penjualan',
      icon: ShoppingCart,
      gradient: 'from-charcoal-900 to-charcoal-800',
      iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      onClick: () => setActiveTab('kasir')
    },
    {
      title: 'Pendapatan Hari Ini',
      value: `Rp ${(data?.pendapatan_hari_ini || 0).toLocaleString('id-ID')}`,
      unit: `Laba: Rp ${(data?.laba_hari_ini || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      gradient: 'from-charcoal-900 to-charcoal-800',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      onClick: () => setActiveTab('laporan')
    },
    {
      title: 'Stok Menipis & Habis',
      value: (data?.stok_menipis || 0) + (data?.stok_habis || 0),
      unit: `${data?.stok_habis || 0} Habis • ${data?.stok_menipis || 0} Menipis`,
      icon: AlertTriangle,
      gradient: 'from-charcoal-900 to-charcoal-800',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      isWarning: (data?.stok_menipis || 0) + (data?.stok_habis || 0) > 0,
      onClick: () => setActiveTab('stok')
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-charcoal-950 text-white p-6 sm:p-8 border border-charcoal-800 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Operasional Aktif</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              ZaynZulfikar<span className="text-gold-400">Store</span>
            </h1>
            <p className="text-charcoal-400 text-xs sm:text-sm mt-1 max-w-xl">
              Kelola kasir, restock barang masuk, dan pantau persediaan toko secara cepat dan akurat.
            </p>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('kasir')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 hover:from-gold-400 hover:to-amber-500 text-charcoal-950 font-extrabold text-xs sm:text-sm shadow-gold-md hover:shadow-gold-lg transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buka Kasir (POS)</span>
            </button>
            <button
              onClick={() => setActiveTab('barang-masuk')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-charcoal-800/80 hover:bg-charcoal-700 text-white border border-charcoal-700 font-semibold text-xs sm:text-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span>Barang Masuk</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className="group cursor-pointer bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm hover:shadow-md hover:border-gold-300 transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 group-hover:text-gold-600 transition-colors">
                {card.value}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-100">
                <span className={`text-xs font-medium ${card.isWarning ? 'text-amber-600 font-bold' : 'text-charcoal-500'}`}>
                  {card.unit}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid: Stok Menipis Alert + Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Critical Stock Alert */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-charcoal-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">Perhatian: Stok Kritis</h3>
                <p className="text-xs text-charcoal-500">Barang yang butuh restock segera</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('stok')}
              className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1"
            >
              <span>Lihat Semua Stok</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data?.critical_items && data.critical_items.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold text-[10px]">
                    <th className="pb-3">Kode</th>
                    <th className="pb-3">Nama Barang</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3 text-center">Tersedia</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {data.critical_items.map((item) => (
                    <tr key={item.id} className="hover:bg-charcoal-50/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-charcoal-600">{item.kode_barang}</td>
                      <td className="py-3 font-semibold text-charcoal-900">{item.nama_barang}</td>
                      <td className="py-3 text-charcoal-500">{item.nama_kategori || '-'}</td>
                      <td className="py-3 text-center font-bold">
                        <span className={item.stok === 0 ? 'text-rose-600' : 'text-amber-600'}>
                          {item.stok} {item.satuan}
                        </span>
                        <span className="text-charcoal-400 text-[10px] block font-normal">Min: {item.stok_minimum}</span>
                      </td>
                      <td className="py-3 text-center">
                        {item.stok === 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                            Habis
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px]">
                            Menipis
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setActiveTab('barang-masuk')}
                          className="px-2.5 py-1 rounded-lg bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white font-semibold text-[11px] transition-all"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Boxes className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-charcoal-800">Semua persediaan barang aman!</p>
              <p className="text-[11px] text-charcoal-500 mt-0.5">Tidak ada produk yang menyentuh batas stok minimum saat ini.</p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 border border-charcoal-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">Transaksi Terbaru</h3>
                <p className="text-xs text-charcoal-500">Penjualan kasir terkini</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('laporan')}
              className="text-xs font-bold text-gold-600 hover:text-gold-700"
            >
              Semua
            </button>
          </div>

          {data?.recent_transactions && data.recent_transactions.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {data.recent_transactions.map((trx) => (
                <div 
                  key={trx.id}
                  className="p-3 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/60 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-charcoal-900">{trx.kode_transaksi}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-charcoal-200 text-charcoal-700">
                        {trx.metode_bayar}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5 truncate">
                      {trx.nama_pelanggan || 'Pelanggan Umum'} • {new Date(trx.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-charcoal-900 block">
                      Rp {parseFloat(trx.total_belanja).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-charcoal-400">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-medium">Belum ada transaksi hari ini.</p>
              <button
                onClick={() => setActiveTab('kasir')}
                className="mt-3 text-xs font-bold text-gold-600 hover:underline"
              >
                Mulai Transaksi Pertama →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
