import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Coins, 
  Check, 
  AlertCircle, 
  X, 
  User, 
  Table, 
  QrCode, 
  CreditCard,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import StrukModal from '../components/StrukModal';

export const Kasir = () => {
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [namaPelanggan, setNamaPelanggan] = useState('Pelanggan Umum');

  // Payment Modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [metodeBayar, setMetodeBayar] = useState('Tunai'); // 'Tunai', 'QRIS', 'Transfer'
  const [uangBayar, setUangBayar] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Receipt Modal state
  const [savedReceipt, setSavedReceipt] = useState(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get('/barang');
      if (res.data.success) {
        setBarangList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Filtered products
  const filteredProducts = barangList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.nama_barang.toLowerCase().includes(q) ||
      item.kode_barang.toLowerCase().includes(q)
    );
  });

  // Cart operations
  const addToCart = (product, qtyToAdd = 1) => {
    if (product.stok <= 0) {
      alert(`Stok "${product.nama_barang}" sudah habis (0)!`);
      return;
    }

    const existingIndex = cart.findIndex((c) => c.id === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].jumlah;
      const newQty = currentQty + qtyToAdd;
      if (newQty > product.stok) {
        alert(`Stok maksimal untuk "${product.nama_barang}" hanya ${product.stok} ${product.satuan}.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].jumlah = newQty;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          barang_id: product.id,
          kode_barang: product.kode_barang,
          nama_barang: product.nama_barang,
          harga_jual: parseFloat(product.harga_jual),
          harga_beli: parseFloat(product.harga_beli),
          stok: product.stok,
          satuan: product.satuan,
          jumlah: qtyToAdd
        }
      ]);
    }
  };

  const updateQuantity = (id, delta) => {
    const updated = cart.map((item) => {
      if (item.id === id) {
        const newQty = item.jumlah + delta;
        if (newQty <= 0) return null;
        if (newQty > item.stok) {
          alert(`Jumlah melebihi stok yang tersedia (${item.stok} ${item.satuan}).`);
          return item;
        }
        return { ...item, jumlah: newQty };
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Kosongkan semua item dari keranjang kasir?')) {
      setCart([]);
    }
  };

  // Calculations
  const totalBelanja = cart.reduce((acc, item) => acc + (item.jumlah * item.harga_jual), 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.jumlah, 0);

  const bayarNum = parseFloat(uangBayar) || 0;
  const kembalian = metodeBayar === 'Tunai' ? Math.max(0, bayarNum - totalBelanja) : 0;
  const isSufficient = metodeBayar !== 'Tunai' || bayarNum >= totalBelanja;

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setUangBayar(totalBelanja.toString());
    setPaymentError('');
    setIsPaymentOpen(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (metodeBayar === 'Tunai' && bayarNum < totalBelanja) {
      setPaymentError(`Uang bayar masih kurang Rp ${(totalBelanja - bayarNum).toLocaleString('id-ID')}`);
      return;
    }

    setSubmitting(true);
    setPaymentError('');

    try {
      const payload = {
        nama_pelanggan: namaPelanggan,
        metode_bayar: metodeBayar,
        uang_bayar: metodeBayar === 'Tunai' ? bayarNum : totalBelanja,
        items: cart.map((item) => ({
          barang_id: item.barang_id,
          jumlah: item.jumlah
        }))
      };

      const res = await api.post('/transaksi', payload);
      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setSavedReceipt(res.data.data);
        setCart([]);
        setIsPaymentOpen(false);
        setNamaPelanggan('Pelanggan Umum');
        fetchCatalog();
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Gagal memproses transaksi kasir.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Bar Kasir */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-charcoal-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-charcoal-900">Kasir / Transaksi (Format Spreadsheet Excel)</h2>
            <p className="text-xs text-charcoal-500">Tampilan tabel data barang rapi, mudah dibaca, dan cepat untuk transaksi penjualan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCatalog}
            className="p-2.5 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-600 transition-colors"
            title="Muat Ulang Katalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Excel Table Katalog (Left) & Excel Invoice Keranjang (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: TABEL KATALOG EXCEL */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Quick Search */}
          <div className="bg-white p-3 rounded-2xl border border-charcoal-200 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari cepat nama produk atau kode barang..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs font-semibold focus:outline-none focus:border-gold-500 focus:bg-white"
              />
            </div>
          </div>

          {/* SPREADSHEET EXCEL TABLE */}
          <div className="bg-white rounded-2xl border-2 border-charcoal-300 shadow-sm overflow-hidden">
            <div className="bg-emerald-800 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>📋 Lembar Kerja Kasir: Daftar Barang</span>
              </div>
              <span className="text-[11px] font-normal text-emerald-200">
                {filteredProducts.length} Produk Tersedia
              </span>
            </div>

            <div className="overflow-x-auto max-h-[62vh] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="sticky top-0 bg-charcoal-100 text-charcoal-700 font-bold border-b-2 border-charcoal-300 select-none text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-charcoal-300 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 border-r border-charcoal-300 w-24">Kode</th>
                    <th className="py-2.5 px-3 border-r border-charcoal-300">Nama Barang</th>
                    <th className="py-2.5 px-3 border-r border-charcoal-300 text-right w-28">Harga Jual</th>
                    <th className="py-2.5 px-3 border-r border-charcoal-300 text-center w-24">Stok</th>
                    <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-charcoal-400">
                        <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-1.5"></div>
                        <span>Memuat data tabel...</span>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-charcoal-500">
                        <p className="font-bold text-sm text-charcoal-700">Belum ada data barang di toko</p>
                        <p className="text-xs text-charcoal-400 mt-1">Silakan masukkan barang terlebih dahulu di menu <b>Barang Masuk</b>.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod, idx) => {
                      const isOutOfStock = prod.stok <= 0;
                      const cartItem = cart.find(c => c.id === prod.id);

                      return (
                        <tr 
                          key={prod.id}
                          className={`border-b border-charcoal-200 hover:bg-gold-50/50 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-charcoal-50/40'
                          } ${isOutOfStock ? 'opacity-50' : ''}`}
                        >
                          <td className="py-2.5 px-3 border-r border-charcoal-200 text-center font-mono text-charcoal-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-charcoal-200 font-mono font-bold text-charcoal-700">
                            {prod.kode_barang}
                          </td>
                          <td className="py-2.5 px-3 border-r border-charcoal-200 font-semibold text-charcoal-900">
                            {prod.nama_barang}
                            <span className="text-[10px] text-charcoal-400 ml-2">({prod.satuan})</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-charcoal-200 text-right font-black text-charcoal-950 font-mono">
                            Rp {parseFloat(prod.harga_jual).toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 border-r border-charcoal-200 text-center">
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-extrabold text-[10px]">
                                Habis (0)
                              </span>
                            ) : (
                              <span className={`font-mono font-bold text-xs ${
                                prod.stok <= prod.stok_minimum ? 'text-amber-600' : 'text-charcoal-800'
                              }`}>
                                {prod.stok} {prod.satuan}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isOutOfStock ? (
                              <button disabled className="px-2 py-1 rounded bg-charcoal-200 text-charcoal-400 text-[10px] font-bold cursor-not-allowed">
                                Kosong
                              </button>
                            ) : cartItem ? (
                              <div className="inline-flex items-center gap-1 bg-gold-100 text-gold-900 px-2 py-0.5 rounded-lg border border-gold-300 font-bold text-xs">
                                <span>{cartItem.jumlah} di nota</span>
                                <button
                                  onClick={() => addToCart(prod, 1)}
                                  className="w-5 h-5 rounded bg-gold-500 text-charcoal-950 flex items-center justify-center font-black"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(prod, 1)}
                                className="px-3 py-1 rounded-lg bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white font-bold text-xs flex items-center justify-center gap-1 mx-auto transition-all shadow-sm active:scale-95"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Pilih</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NOTA KERANJANG FORMAT EXCEL INVOICE */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-2xl border-2 border-charcoal-300 shadow-sm overflow-hidden flex flex-col h-full sticky top-20">
            {/* Header Nota Excel */}
            <div className="bg-charcoal-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gold-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Lembar Nota Belanja</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-rose-300 hover:text-rose-100 underline"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* Input Nama Pelanggan */}
            <div className="p-3 bg-charcoal-50 border-b border-charcoal-200 flex items-center gap-2 text-xs">
              <User className="w-4 h-4 text-charcoal-500" />
              <input
                type="text"
                value={namaPelanggan}
                onChange={(e) => setNamaPelanggan(e.target.value)}
                placeholder="Nama Pelanggan"
                className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-charcoal-300 font-semibold text-charcoal-800 focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>

            {/* Excel Table Items Inside Cart */}
            <div className="flex-1 overflow-y-auto max-h-[42vh] p-2">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-charcoal-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-25" />
                  <p className="text-xs font-bold text-charcoal-600">Nota masih kosong</p>
                  <p className="text-[11px] text-charcoal-400 mt-0.5">Klik tombol "Pilih" pada tabel di sebelah kiri.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border border-charcoal-200">
                  <thead className="bg-charcoal-100 text-charcoal-700 font-bold border-b border-charcoal-300 text-[10px]">
                    <tr>
                      <th className="py-2 px-2">Nama Barang</th>
                      <th className="py-2 px-1 text-center w-16">Jumlah</th>
                      <th className="py-2 px-2 text-right">Subtotal</th>
                      <th className="py-2 px-1 text-center w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-200">
                    {cart.map((item) => (
                      <tr key={item.id} className="hover:bg-charcoal-50">
                        <td className="py-2 px-2">
                          <div className="font-bold text-charcoal-900 leading-tight">{item.nama_barang}</div>
                          <span className="text-[10px] text-charcoal-400">
                            @ Rp {item.harga_jual.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-2 px-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-4 h-4 rounded bg-charcoal-200 text-charcoal-700 flex items-center justify-center font-bold hover:bg-charcoal-300"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs w-4 text-center">{item.jumlah}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-4 h-4 rounded bg-charcoal-200 text-charcoal-700 flex items-center justify-center font-bold hover:bg-charcoal-300"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-charcoal-900 whitespace-nowrap">
                          Rp {(item.jumlah * item.harga_jual).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-1 text-center">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-charcoal-400 hover:text-rose-600 p-0.5"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Total & Checkout Button */}
            <div className="p-4 bg-charcoal-50 border-t-2 border-charcoal-300 space-y-3">
              <div className="flex justify-between text-xs text-charcoal-600">
                <span>Total Item Belanja:</span>
                <span className="font-bold text-charcoal-900">{totalItemCount} Unit</span>
              </div>
              <div className="flex justify-between text-base font-black text-charcoal-950 pt-2 border-t border-charcoal-200">
                <span>TOTAL HARGA:</span>
                <span className="text-gold-700 font-mono text-lg">
                  Rp {totalBelanja.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={handleOpenPayment}
                disabled={cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Coins className="w-4 h-4" />
                <span>Bayar Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-charcoal-200">
            <div className="bg-charcoal-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Pembayaran Transaksi</h3>
                <span className="text-[11px] text-charcoal-400">Total {totalItemCount} barang</span>
              </div>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
              {paymentError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Total Belanja */}
              <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  Total Tagihan Belanja
                </span>
                <div className="text-3xl font-black text-charcoal-950 mt-1 font-mono">
                  Rp {totalBelanja.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Metode Bayar */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Tunai', label: 'Tunai', icon: Coins },
                    { id: 'QRIS', label: 'QRIS', icon: QrCode },
                    { id: 'Transfer', label: 'Transfer', icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = metodeBayar === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setMetodeBayar(m.id);
                          if (m.id !== 'Tunai') setUangBayar(totalBelanja.toString());
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                          isSelected
                            ? 'bg-charcoal-900 text-gold-400 border-charcoal-900 shadow-sm'
                            : 'bg-charcoal-50 text-charcoal-700 border-charcoal-200 hover:bg-charcoal-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tunai Inputs */}
              {metodeBayar === 'Tunai' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Uang Tunai Diterima (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min={totalBelanja}
                      value={uangBayar}
                      onChange={(e) => setUangBayar(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-lg font-mono font-bold text-charcoal-950 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* Kembalian */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">Kembalian:</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">
                      Rp {kembalian.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isSufficient}
                className="w-full py-3.5 px-4 rounded-xl bg-charcoal-900 hover:bg-gold-500 hover:text-charcoal-950 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-40"
              >
                {submitting ? (
                  <span>Menyimpan Transaksi...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Selesaikan & Cetak Struk</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Struk Modal */}
      {savedReceipt && (
        <StrukModal
          receipt={savedReceipt}
          onClose={() => setSavedReceipt(null)}
        />
      )}
    </div>
  );
};

export default Kasir;
