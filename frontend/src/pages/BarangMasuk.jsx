import React, { useState, useEffect } from 'react';
import { 
  ArrowDownToLine, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Package, 
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

export const BarangMasuk = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Direct manual input form
  const [formData, setFormData] = useState({
    nama_barang: '',
    jumlah: '',
    satuan: 'Pcs',
    harga_beli: '',
    harga_jual: ''
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/barang-masuk');
      if (res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching barang masuk:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Instant Profit & Total Calculations
  const qtyNum = parseInt(formData.jumlah) || 0;
  const buyNum = parseFloat(formData.harga_beli) || 0;
  const sellNum = parseFloat(formData.harga_jual) || 0;
  const totalBiaya = qtyNum * buyNum;
  const labaPerUnit = sellNum - buyNum;
  const estimasiTotalLaba = qtyNum * labaPerUnit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nama_barang.trim()) {
      setFormError('Nama barang wajib diisi secara manual.');
      return;
    }
    if (qtyNum <= 0) {
      setFormError('Jumlah barang masuk harus minimal 1.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/barang-masuk', {
        nama_barang: formData.nama_barang.trim(),
        jumlah: qtyNum,
        satuan: formData.satuan || 'Pcs',
        harga_beli: buyNum,
        harga_jual: sellNum
      });

      if (res.data.success) {
        showToast(res.data.message);
        // Reset form to clean state
        setFormData({
          nama_barang: '',
          jumlah: '',
          satuan: 'Pcs',
          harga_beli: '',
          harga_jual: ''
        });
        // Immediately refresh history list below
        fetchHistory();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan barang masuk.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
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
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-charcoal-900">Pencatatan Barang Masuk</h2>
            <p className="text-xs text-charcoal-500">Ketik nama barang manual, tentukan harga beli & harga jual. Data langsung masuk & tersimpan otomatis.</p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2.5 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-600 self-start sm:self-auto transition-colors"
          title="Segarkan Riwayat"
        >
          <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin text-gold-500' : ''}`} />
        </button>
      </div>

      {/* FORM INPUT MANUAL CEPAT */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-sm">
        <h3 className="text-sm font-bold text-charcoal-900 mb-4 pb-3 border-b border-charcoal-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-gold-600" />
          <span>Form Input Barang Masuk Manual</span>
        </h3>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Nama Barang (Manual Input) */}
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Nama Barang <span className="text-rose-500">* (Ketik Manual)</span>
              </label>
              <input
                type="text"
                required
                name="nama_barang"
                value={formData.nama_barang}
                onChange={handleChange}
                placeholder="Contoh: Beras Rojolele 5kg, Minyak Fortune 1L, dll."
                className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-sm font-semibold focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              />
            </div>

            {/* Jumlah Masuk */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Jumlah Masuk <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                placeholder="10"
                className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-sm font-mono font-bold focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              />
            </div>

            {/* Satuan */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Satuan
              </label>
              <input
                type="text"
                name="satuan"
                value={formData.satuan}
                onChange={handleChange}
                placeholder="Pcs / Btl / Sak / Dus"
                className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Harga Beli Satuan */}
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Harga Beli Satuan / Modal (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-charcoal-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  required
                  name="harga_beli"
                  value={formData.harga_beli}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-charcoal-300 text-sm font-mono font-bold text-charcoal-800 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Harga Jual Satuan */}
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Harga Jual Satuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-charcoal-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  required
                  name="harga_jual"
                  value={formData.harga_jual}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-charcoal-300 text-sm font-mono font-bold text-gold-700 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Kartu Kalkulasi Laba & Modal Otomatis */}
          <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-charcoal-500 text-[11px] block">Total Biaya Masuk (Modal):</span>
              <span className="text-sm font-bold text-charcoal-900">
                Rp {totalBiaya.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-charcoal-500 text-[11px] block">Estimasi Laba per Unit:</span>
              <span className={`text-sm font-bold ${labaPerUnit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                Rp {labaPerUnit.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-charcoal-500 text-[11px] block">Potensi Keuntungan Total:</span>
              <span className={`text-sm font-extrabold ${estimasiTotalLaba >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                Rp {estimasiTotalLaba.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan Barang Masuk'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* TABEL RIWAYAT BARANG MASUK (LANGSUNG MUNCUL DI BAWAHNYA) */}
      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-600" />
            <div>
              <h3 className="font-bold text-sm text-charcoal-900">Riwayat Barang Masuk</h3>
              <p className="text-xs text-charcoal-500">Data barang yang baru saja dimasukkan langsung muncul di bawah ini</p>
            </div>
          </div>
          <span className="text-xs font-bold text-charcoal-700 bg-charcoal-100 px-3 py-1 rounded-full">
            {historyList.length} Catatan Masuk
          </span>
        </div>

        {loadingHistory ? (
          <div className="py-12 text-center text-charcoal-400 text-xs">
            <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Memperbarui riwayat barang masuk...</span>
          </div>
        ) : historyList.length === 0 ? (
          <div className="py-12 text-center text-charcoal-400 text-xs border border-dashed border-charcoal-200 rounded-2xl">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30 text-charcoal-500" />
            <p className="font-semibold text-charcoal-700">Belum ada barang masuk</p>
            <p className="text-[11px] text-charcoal-400 mt-0.5">Ketik nama barang pada form di atas untuk memasukkan barang pertama Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-charcoal-50/80 border-b border-charcoal-200 text-charcoal-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Waktu Masuk</th>
                  <th className="py-3.5 px-4">Kode</th>
                  <th className="py-3.5 px-4">Nama Barang</th>
                  <th className="py-3.5 px-4 text-center">Jumlah Masuk</th>
                  <th className="py-3.5 px-4 text-right">Harga Beli</th>
                  <th className="py-3.5 px-4 text-right">Harga Jual</th>
                  <th className="py-3.5 px-4 text-right">Total Biaya</th>
                  <th className="py-3.5 px-4 text-right">Laba/Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {historyList.map((row, idx) => {
                  const buy = parseFloat(row.harga_beli) || 0;
                  const sell = parseFloat(row.harga_jual) || 0;
                  const profitUnit = sell - buy;

                  return (
                    <tr key={row.id || idx} className="hover:bg-charcoal-50/60 transition-colors">
                      <td className="py-3 px-4 text-charcoal-600 whitespace-nowrap">
                        {new Date(row.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-700 whitespace-nowrap">
                        {row.kode_barang || row.kode_masuk}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-charcoal-900">{row.nama_barang || 'Barang'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-charcoal-900 text-sm">
                          {row.jumlah || row.total_item}
                        </span>
                        <span className="text-[10px] text-charcoal-400 ml-1">{row.satuan || 'Pcs'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-charcoal-700 whitespace-nowrap">
                        Rp {buy.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gold-700 whitespace-nowrap">
                        Rp {sell.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-charcoal-900 whitespace-nowrap">
                        Rp {(parseFloat(row.subtotal) || parseFloat(row.total_biaya) || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                        Rp {profitUnit.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarangMasuk;
