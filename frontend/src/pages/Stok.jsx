import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ArrowDownToLine, 
  Filter, 
  RefreshCw,
  Coins,
  X
} from 'lucide-react';
import api from '../services/api';

export const Stok = ({ setActiveTab }) => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'menipis', 'habis', 'aman'

  // Adjust stock modal
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [newStokValue, setNewStokValue] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/stok', { params });
      if (res.data.success) {
        setItems(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStockData();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const openAdjustModal = (item) => {
    setAdjustingItem(item);
    setNewStokValue(item.stok.toString());
    setAdjustReason('Stock Opname / Koreksi fisik');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setSubmittingAdjust(true);
    try {
      const res = await api.put(`/stok/${adjustingItem.id}/adjust`, {
        stok_baru: parseInt(newStokValue),
        catatan: adjustReason
      });

      if (res.data.success) {
        showToast(res.data.message);
        setAdjustingItem(null);
        fetchStockData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyesuaikan stok.');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-charcoal-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-charcoal-700 flex items-center gap-2.5 text-xs font-semibold animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-charcoal-900">Monitoring Persediaan Stok Real-Time</h2>
            <p className="text-xs text-charcoal-500">Pantau ketersediaan seluruh barang, peringatan stok kritis & penyesuaian opname</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStockData}
            className="p-2.5 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-600 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-500' : ''}`} />
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab('barang-masuk')}
            className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Restock Barang</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div 
            onClick={() => setStatusFilter('')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              statusFilter === ''
                ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-md'
                : 'bg-white text-charcoal-800 border-charcoal-200 hover:border-charcoal-400'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Semua Produk</span>
            <div className="text-xl sm:text-2xl font-black mt-1">{summary.total_produk} Item</div>
            <span className="text-[11px] block mt-0.5 opacity-80">{summary.total_unit_tersedia || 0} unit tersedia</span>
          </div>

          <div 
            onClick={() => setStatusFilter('aman')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              statusFilter === 'aman'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                : 'bg-white text-charcoal-800 border-charcoal-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Stok Aman</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-emerald-600">{summary.produk_aman} Item</div>
            <span className="text-[11px] block mt-0.5 text-charcoal-500">&gt; Stok Minimum</span>
          </div>

          <div 
            onClick={() => setStatusFilter('menipis')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              statusFilter === 'menipis'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                : 'bg-white text-charcoal-800 border-charcoal-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Stok Menipis</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-amber-600">{summary.produk_menipis} Item</div>
            <span className="text-[11px] block mt-0.5 text-charcoal-500">&le; Stok Minimum</span>
          </div>

          <div 
            onClick={() => setStatusFilter('habis')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              statusFilter === 'habis'
                ? 'bg-rose-700 text-white border-rose-700 shadow-md'
                : 'bg-white text-charcoal-800 border-charcoal-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Stok Habis</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-rose-600">{summary.produk_habis} Item</div>
            <span className="text-[11px] block mt-0.5 text-charcoal-500">Stok = 0</span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-gold-500/10 to-amber-500/10 border border-gold-300/60 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-800 block">Total Nilai Persediaan</span>
            <div className="text-lg font-black text-gold-900 mt-1">
              Rp {parseFloat(summary.total_aset_modal || 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-gold-700 block mt-0.5">Estimasi Modal Aset</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau nama barang persediaan..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${statusFilter === '' ? 'bg-charcoal-900 text-white' : 'bg-charcoal-100 text-charcoal-600'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('menipis')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${statusFilter === 'menipis' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}
          >
            Menipis
          </button>
          <button
            onClick={() => setStatusFilter('habis')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${statusFilter === 'habis' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
          >
            Habis
          </button>
          <button
            onClick={() => setStatusFilter('aman')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${statusFilter === 'aman' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
          >
            Aman
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-charcoal-50/80 border-b border-charcoal-200 text-charcoal-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-center">Stok Fisik</th>
                <th className="py-3.5 px-4 text-center">Batas Minimum</th>
                <th className="py-3.5 px-4 text-center">Indikator</th>
                <th className="py-3.5 px-4 text-right">Aksi Penyesuaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal-400">
                    <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Memperbarui status stok...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-charcoal-700">Tidak ada produk dalam kriteria ini</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-charcoal-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-charcoal-700">{item.kode_barang}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal-900">{item.nama_barang}</div>
                      <span className="text-[10px] text-charcoal-400">Satuan: {item.satuan}</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 font-medium">
                      {item.nama_kategori || 'Umum'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-base font-black ${
                        item.stok === 0
                          ? 'text-rose-600'
                          : item.stok <= item.stok_minimum
                          ? 'text-amber-600'
                          : 'text-charcoal-900'
                      }`}>
                        {item.stok}
                      </span>
                      <span className="text-[10px] text-charcoal-400 ml-1">{item.satuan}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-charcoal-600">
                      {item.stok_minimum} {item.satuan}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status_stok === 'habis' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Habis</span>
                        </span>
                      ) : item.status_stok === 'menipis' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Menipis</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aman</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openAdjustModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-charcoal-200 hover:border-gold-400 hover:bg-gold-50 text-charcoal-700 font-semibold text-xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gold-600" />
                        <span>Koreksi Stok</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-charcoal-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
              <h3 className="font-bold text-sm text-charcoal-900">Koreksi Stok Fisik</h3>
              <button onClick={() => setAdjustingItem(null)} className="text-charcoal-400 hover:text-charcoal-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-500 mb-4">
              Sesuaikan jumlah stok untuk <b>"{adjustingItem.nama_barang}"</b> jika terdapat selisih fisik atau barang rusak.
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Stok Fisik Baru ({adjustingItem.satuan})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStokValue}
                  onChange={(e) => setNewStokValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm font-mono font-bold focus:outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-charcoal-400 mt-1 block">
                  Stok saat ini di sistem: {adjustingItem.stok} {adjustingItem.satuan}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Alasan / Catatan Penyesuaian
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Contoh: Barang rusak / selisih opname"
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="flex-1 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submittingAdjust ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stok;
