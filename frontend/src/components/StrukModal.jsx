import React from 'react';
import { Printer, Share2, X, CheckCircle2 } from 'lucide-react';

export const StrukModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWA = () => {
    const lines = [
      `*🧾 STRUK BELANJA ZAYNZULFIKARSTORE*`,
      `Kode: ${receipt.kode_transaksi}`,
      `Tanggal: ${new Date(receipt.tanggal).toLocaleString('id-ID')}`,
      `Pelanggan: ${receipt.nama_pelanggan || 'Umum'}`,
      `--------------------------------`,
      ...(receipt.items || []).map(
        (item) => `${item.nama_barang || item.nama_barang_snapshot} (${item.jumlah}x) = Rp ${(item.subtotal || item.jumlah * item.harga_jual).toLocaleString('id-ID')}`
      ),
      `--------------------------------`,
      `*Total: Rp ${parseFloat(receipt.total_belanja).toLocaleString('id-ID')}*`,
      `Metode: ${receipt.metode_bayar}`,
      `Bayar: Rp ${parseFloat(receipt.uang_bayar).toLocaleString('id-ID')}`,
      `Kembali: Rp ${parseFloat(receipt.kembalian).toLocaleString('id-ID')}`,
      `--------------------------------`,
      `Terima kasih sudah berbelanja di ZaynZulfikarStore!`
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-charcoal-200">
        {/* Header */}
        <div className="bg-charcoal-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Transaksi Berhasil Disimpan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="p-6 bg-amber-50/20 text-charcoal-900 max-h-[65vh] overflow-y-auto" id="printable-receipt">
          <div className="text-center pb-3 border-b border-dashed border-charcoal-300">
            <h2 className="font-extrabold text-base tracking-wider text-charcoal-950 uppercase">
              ZAYN ZULFIKAR STORE
            </h2>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Jl. Perintis Kemerdekaan No. 88
            </p>
            <p className="text-[11px] text-charcoal-500">
              Telp / WA: 0812-3456-7890
            </p>
          </div>

          <div className="py-2.5 text-[11px] space-y-0.5 border-b border-dashed border-charcoal-300 text-charcoal-600">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <span className="font-mono font-bold text-charcoal-900">{receipt.kode_transaksi}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>{new Date(receipt.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span className="font-semibold text-charcoal-800">{receipt.nama_pelanggan || 'Pelanggan Umum'}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>Administrator</span>
            </div>
          </div>

          {/* Items */}
          <div className="py-3 border-b border-dashed border-charcoal-300 space-y-2">
            {(receipt.items || []).map((item, idx) => (
              <div key={idx} className="text-xs">
                <div className="font-semibold text-charcoal-900 leading-tight">
                  {item.nama_barang || item.nama_barang_snapshot}
                </div>
                <div className="flex justify-between text-charcoal-500 text-[11px] mt-0.5">
                  <span>
                    {item.jumlah} x Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}
                  </span>
                  <span className="font-bold text-charcoal-800">
                    Rp {parseFloat(item.subtotal || item.jumlah * item.harga_jual).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2.5 text-xs space-y-1.5 border-b border-dashed border-charcoal-300">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal:</span>
              <span>Rp {parseFloat(receipt.total_belanja).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-charcoal-950 pt-1 border-t border-charcoal-200">
              <span>TOTAL:</span>
              <span className="text-gold-700">Rp {parseFloat(receipt.total_belanja).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Metode Bayar:</span>
              <span className="font-medium">{receipt.metode_bayar}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Uang Diterima:</span>
              <span>Rp {parseFloat(receipt.uang_bayar).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-700">
              <span>Kembalian:</span>
              <span>Rp {parseFloat(receipt.kembalian).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 text-[10px] text-charcoal-500 leading-relaxed">
            <p className="font-semibold text-charcoal-700">Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar kembali.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-charcoal-50 border-t border-charcoal-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>Cetak Struk</span>
          </button>
          <button
            onClick={handleShareWA}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95"
            title="Kirim Struk via WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-charcoal-200 hover:bg-charcoal-300 text-charcoal-800 font-semibold text-xs transition-colors active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrukModal;
