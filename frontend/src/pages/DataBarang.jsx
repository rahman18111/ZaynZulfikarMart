import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Tag, 
  TrendingUp,
  ArrowUpDown
} from 'lucide-react';
import api from '../services/api';

export const DataBarang = () => {
  const [barangList, setBarangList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isKatModalOpen, setIsKatModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_barang: '',
    kategori_id: '',
    harga_beli: '',
    harga_jual: '',
    stok: '',
    stok_minimum: '5',
    satuan: 'Pcs'
  });

  const [newKatName, setNewKatName] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchKategori = async () => {
    try {
      const res = await api.get('/kategori');
      if (res.data.success) {
        setKategoriList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching kategori:', err);
    }
  };

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedKategori) params.kategori_id = selectedKategori;
      if (selectedStatus) params.status_stok = selectedStatus;

      const res = await api.get('/barang', { params });
      if (res.data.success) {
        setBarangList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching barang:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBarang();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedKategori, selectedStatus]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      kode_barang: '',
      nama_barang: '',
      kategori_id: kategoriList.length > 0 ? kategoriList[0].id : '',
      harga_beli: '',
      harga_jual: '',
      stok: '0',
      stok_minimum: '5',
      satuan: 'Pcs'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      kategori_id: item.kategori_id || '',
      harga_beli: item.harga_beli,
      harga_jual: item.harga_jual,
      stok: item.stok,
      stok_minimum: item.stok_minimum,
      satuan: item.satuan || 'Pcs'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingItem) {
        // Update
        const res = await api.put(`/barang/${editingItem.id}`, formData);
        if (res.data.success) {
          showToast(`Barang "${formData.nama_barang}" berhasil diperbarui.`);
          setIsModalOpen(false);
          fetchBarang();
        }
      } else {
        // Create
        const res = await api.post('/barang', formData);
        if (res.data.success) {
          showToast(`Barang "${formData.nama_barang}" berhasil ditambahkan.`);
          setIsModalOpen(false);
          fetchBarang();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data barang.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      setSubmitting(true);
      const res = await api.delete(`/barang/${deletingItem.id}`);
      if (res.data.success) {
        showToast('Barang berhasil dihapus.');
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchBarang();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus barang.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateKategori = async (e) => {
    e.preventDefault();
    if (!newKatName.trim()) return;
    try {
      const res = await api.post('/kategori', { nama_kategori: newKatName.trim() });
      if (res.data.success) {
        await fetchKategori();
        setFormData(prev => ({ ...prev, kategori_id: res.data.data.id }));
        setNewKatName('');
        setIsKatModalOpen(false);
        showToast('Kategori baru berhasil dibuat!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat kategori.');
    }
  };

  // Calculate profit margin helper
  const buyNum = parseFloat(formData.harga_beli) || 0;
  const sellNum = parseFloat(formData.harga_jual) || 0;
  const profitNum = sellNum - buyNum;
  const marginPercent = buyNum > 0 ? ((profitNum / buyNum) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-charcoal-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-charcoal-700 flex items-center gap-2.5 text-xs font-semibold animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-charcoal-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-charcoal-900">Katalog Data Barang</h2>
            <p className="text-xs text-charcoal-500">Total: {barangList.length} produk terdaftar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKatModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-charcoal-700 hover:bg-charcoal-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-gold-600" />
            <span>Kategori</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-charcoal-950 font-bold text-xs flex items-center gap-1.5 shadow-gold-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode barang atau nama produk..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs font-medium focus:outline-none focus:border-gold-500 focus:bg-white"
          />
        </div>

        {/* Kategori Filter */}
        <div>
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs font-medium focus:outline-none focus:border-gold-500"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((kat) => (
              <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
            ))}
          </select>
        </div>

        {/* Status Stok Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs font-medium focus:outline-none focus:border-gold-500"
          >
            <option value="">Status Stok (Semua)</option>
            <option value="aman">🟢 Stok Aman</option>
            <option value="menipis">🟡 Stok Menipis</option>
            <option value="habis">🔴 Stok Habis</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-charcoal-50/80 border-b border-charcoal-200 text-charcoal-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Barang</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Beli</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-center">Stok / Min</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal-400">
                    <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Memuat daftar barang...</span>
                  </td>
                </tr>
              ) : barangList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-charcoal-700">Tidak ada data barang ditemukan</p>
                    <p className="text-[11px] mt-0.5">Coba sesuaikan kata kunci pencarian atau tambah barang baru.</p>
                  </td>
                </tr>
              ) : (
                barangList.map((item) => (
                  <tr key={item.id} className="hover:bg-charcoal-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-charcoal-700">
                      {item.kode_barang}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal-900">{item.nama_barang}</div>
                      <span className="text-[10px] text-charcoal-400">Satuan: {item.satuan}</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-charcoal-100 text-charcoal-700 text-[11px]">
                        {item.nama_kategori || 'Umum'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-charcoal-600 font-medium">
                      Rp {parseFloat(item.harga_beli).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-charcoal-900">
                      Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-charcoal-900 text-sm">{item.stok}</span>
                      <span className="text-[11px] text-charcoal-400 block">Min: {item.stok_minimum}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status_stok === 'habis' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                          Habis
                        </span>
                      ) : item.status_stok === 'menipis' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px]">
                          Menipis
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-600 hover:bg-gold-50 transition-colors"
                          title="Edit Barang"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingItem(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View (for HP screen) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center text-charcoal-400">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Memuat daftar barang...</span>
          </div>
        ) : barangList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-charcoal-400 border border-charcoal-200">
            <p className="font-semibold text-charcoal-700">Tidak ada barang ditemukan</p>
          </div>
        ) : (
          barangList.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-sm space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-charcoal-500">{item.kode_barang}</span>
                  <h3 className="font-bold text-sm text-charcoal-900 leading-tight">{item.nama_barang}</h3>
                  <span className="text-[11px] text-charcoal-500">{item.nama_kategori || 'Umum'} • Satuan: {item.satuan}</span>
                </div>
                <div>
                  {item.status_stok === 'habis' ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                      Habis
                    </span>
                  ) : item.status_stok === 'menipis' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px]">
                      Menipis
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                      Aman
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-charcoal-100">
                <div>
                  <span className="text-charcoal-400 text-[10px] block">Harga Jual:</span>
                  <span className="font-extrabold text-charcoal-900">Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 text-[10px] block text-right">Stok:</span>
                  <span className="font-extrabold text-charcoal-900 text-right block">{item.stok} {item.satuan}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-charcoal-100 text-charcoal-700 hover:text-gold-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingItem(item);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-charcoal-200">
            <div className="bg-charcoal-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingItem ? 'Edit Data Barang' : 'Tambah Barang Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Kode Barang <span className="text-charcoal-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kode_barang}
                    onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                    placeholder="Otomatis jika kosong"
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriList.map((kat) => (
                      <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Nama Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_barang}
                  onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                  placeholder="Contoh: Minyak Goreng Sania 2L"
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Harga Beli / Modal (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.harga_beli}
                    onChange={(e) => setFormData({ ...formData, harga_beli: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Harga Jual (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.harga_jual}
                    onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-mono font-bold text-gold-700"
                  />
                </div>
              </div>

              {/* Profit Indicator Card */}
              {sellNum > 0 && (
                <div className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-charcoal-600">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Estimasi Laba per Unit:</span>
                  </div>
                  <div className="font-bold text-emerald-700">
                    Rp {profitNum.toLocaleString('id-ID')} ({marginPercent}%)
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Stok {editingItem ? 'Saat Ini' : 'Awal'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Stok Min.
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stok_minimum}
                    onChange={(e) => setFormData({ ...formData, stok_minimum: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    placeholder="Pcs/Btl"
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-semibold hover:bg-charcoal-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-charcoal-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">Hapus Barang?</h3>
            <p className="text-xs text-charcoal-500 mt-1 mb-4">
              Apakah Anda yakin ingin menghapus <b>"{deletingItem.nama_barang}"</b>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-semibold hover:bg-charcoal-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Kategori Modal */}
      {isKatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-charcoal-200">
            <h3 className="font-bold text-sm text-charcoal-900 mb-1">Tambah Kategori Baru</h3>
            <p className="text-xs text-charcoal-500 mb-4">Buat label kategori untuk mengelompokkan produk</p>

            <form onSubmit={handleCreateKategori} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={newKatName}
                  onChange={(e) => setNewKatName(e.target.value)}
                  placeholder="Contoh: Alat Tulis & Kantor"
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsKatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white text-xs font-bold transition-all"
                >
                  Tambah Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBarang;
