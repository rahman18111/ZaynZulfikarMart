import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  ArrowDownToLine, 
  TrendingUp, 
  Printer, 
  Eye, 
  X,
  Filter
} from 'lucide-react';
import api from '../services/api';
import StrukModal from '../components/StrukModal';

export const Laporan = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // View detail modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const res = await api.get('/laporan', {
        params: { start_date: startDate, end_date: endDate }
      });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching laporan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [startDate, endDate]);

  const setPreset = (preset) => {
    const today = new Date();
    if (preset === 'today') {
      const s = today.toISOString().slice(0, 10);
      setStartDate(s);
      setEndDate(s);
    } else if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const s = y.toISOString().slice(0, 10);
      setStartDate(s);
      setEndDate(s);
    } else if (preset === 'week') {
      const w = new Date(today);
      w.setDate(today.getDate() - 6);
      setStartDate(w.toISOString().slice(0, 10));
      setEndDate(today.toISOString().slice(0, 10));
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(today.toISOString().slice(0, 10));
    }
  };

  const viewTransactionReceipt = async (id) => {
    try {
      const res = await api.get(`/transaksi/${id}`);
      if (res.data.success) {
        setSelectedReceipt(res.data.data);
      }
    } catch (err) {
      alert('Gagal memuat struk transaksi.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Date Filter */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-charcoal-900">Laporan Operasional Toko</h2>
            <p className="text-xs text-charcoal-500">Rekapitulasi penjualan kasir, barang terjual, kulakan & laba kotor</p>
          </div>
        </div>

        {/* Date Filters & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Presets */}
          <div className="flex items-center gap-1 bg-charcoal-50 p-1 rounded-xl border border-charcoal-200 text-xs font-semibold">
            <button
              onClick={() => setPreset('today')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${startDate === todayStr && endDate === todayStr ? 'bg-charcoal-900 text-gold-400 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPreset('yesterday')}
              className="px-2.5 py-1 rounded-lg text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              Kemarin
            </button>
            <button
              onClick={() => setPreset('week')}
              className="px-2.5 py-1 rounded-lg text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              7 Hari
            </button>
            <button
              onClick={() => setPreset('month')}
              className="px-2.5 py-1 rounded-lg text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              Bulan Ini
            </button>
          </div>

          {/* Date Picker Inputs */}
          <div className="flex items-center gap-1.5 bg-charcoal-50 px-3 py-1.5 rounded-xl border border-charcoal-200 text-xs">
            <Calendar className="w-4 h-4 text-gold-600" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-charcoal-800 focus:outline-none"
            />
            <span className="text-charcoal-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-charcoal-800 focus:outline-none"
            />
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards required by user prompt */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Jumlah Transaksi */}
          <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">Jumlah Transaksi</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-charcoal-900">{summary.total_transaksi}</div>
            <span className="text-[11px] text-charcoal-500 mt-0.5 block">Nota Selesai</span>
          </div>

          {/* 2. Total Barang Terjual */}
          <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">Barang Terjual</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-charcoal-900">{summary.total_barang_terjual}</div>
            <span className="text-[11px] text-charcoal-500 mt-0.5 block">Unit Produk</span>
          </div>

          {/* 3. Total Barang Masuk */}
          <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">Barang Masuk</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ArrowDownToLine className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-charcoal-900">{summary.total_barang_masuk}</div>
            <span className="text-[11px] text-charcoal-500 mt-0.5 block">Unit Restock</span>
          </div>

          {/* 4. Total Pendapatan / Omset */}
          <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">Total Pendapatan</span>
              <div className="w-7 h-7 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-charcoal-900">
              Rp {summary.total_pendapatan.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-charcoal-500 mt-0.5 block">Omset Kotor</span>
          </div>

          {/* 5. Laba Kotor */}
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-charcoal-900 to-charcoal-950 text-white p-4 rounded-2xl border border-charcoal-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Estimasi Laba Kotor</span>
              <div className="w-7 h-7 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gold-400">
              Rp {summary.total_laba_kotor.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-charcoal-400 mt-0.5 block">Pendapatan - Modal</span>
          </div>
        </div>
      )}



      {/* Riwayat Transaksi Berdasarkan Tanggal */}
      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-charcoal-900">Riwayat Transaksi Penjualan</h3>
            <p className="text-xs text-charcoal-500">
              Daftar seluruh nota penjualan pada periode {startDate} s/d {endDate}
            </p>
          </div>
          <span className="text-xs font-semibold text-charcoal-600 bg-charcoal-100 px-3 py-1 rounded-full">
            {reportData?.transaksi_list?.length || 0} Transaksi
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-charcoal-400 text-xs">
            <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Menghitung data transaksi...</span>
          </div>
        ) : !reportData?.transaksi_list || reportData.transaksi_list.length === 0 ? (
          <div className="py-10 text-center text-charcoal-400 text-xs">
            <p className="font-semibold text-charcoal-600">Tidak ada transaksi penjualan pada rentang tanggal ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3">Kode Transaksi</th>
                  <th className="pb-3">Waktu</th>
                  <th className="pb-3">Pelanggan</th>
                  <th className="pb-3">Metode</th>
                  <th className="pb-3 text-center">Unit</th>
                  <th className="pb-3 text-right">Total Belanja</th>
                  <th className="pb-3 text-right">Laba Kotor</th>
                  <th className="pb-3 text-right">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {reportData.transaksi_list.map((trx) => (
                  <tr key={trx.id} className="hover:bg-charcoal-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-charcoal-900">{trx.kode_transaksi}</td>
                    <td className="py-3 text-charcoal-600">
                      {new Date(trx.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 text-charcoal-800 font-semibold">{trx.nama_pelanggan || 'Umum'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-charcoal-100 text-charcoal-700 text-[10px] font-bold">
                        {trx.metode_bayar}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-charcoal-900">{trx.total_item} Pcs</td>
                    <td className="py-3 text-right font-extrabold text-charcoal-900">
                      Rp {parseFloat(trx.total_belanja).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-700">
                      Rp {parseFloat(trx.laba_kotor).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => viewTransactionReceipt(trx.id)}
                        className="p-1.5 rounded-lg text-charcoal-500 hover:text-gold-600 hover:bg-gold-50"
                        title="Lihat & Cetak Struk"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Struk Modal */}
      {selectedReceipt && (
        <StrukModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default Laporan;
