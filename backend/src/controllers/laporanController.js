import pool from '../config/db.js';

// Get Daily & Periodic Operational Report
export const getLaporan = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Default to today if no date specified
    const today = new Date().toISOString().slice(0, 10);
    const startDate = start_date || today;
    const endDate = end_date || today;

    // 1. Transaction metrics in range
    const [trxSummary] = await pool.query(`
      SELECT 
        COUNT(id) AS total_transaksi,
        COALESCE(SUM(total_belanja), 0) AS total_pendapatan,
        COALESCE(SUM(total_modal), 0) AS total_modal,
        COALESCE(SUM(laba_kotor), 0) AS total_laba_kotor
      FROM transaksi
      WHERE DATE(tanggal) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 2. Total items sold in range
    const [soldSummary] = await pool.query(`
      SELECT 
        COALESCE(SUM(td.jumlah), 0) AS total_barang_terjual
      FROM transaksi_detail td
      JOIN transaksi t ON td.transaksi_id = t.id
      WHERE DATE(t.tanggal) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 3. Total incoming goods in range
    const [inflowSummary] = await pool.query(`
      SELECT 
        COUNT(id) AS total_sesi_masuk,
        COALESCE(SUM(total_item), 0) AS total_barang_masuk,
        COALESCE(SUM(total_biaya), 0) AS total_biaya_masuk
      FROM barang_masuk
      WHERE DATE(tanggal) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 4. Top 5 Best Selling Items in range
    const [topProducts] = await pool.query(`
      SELECT 
        td.nama_barang_snapshot AS nama_barang,
        SUM(td.jumlah) AS total_terjual,
        SUM(td.subtotal) AS total_omset,
        SUM(td.laba) AS total_laba
      FROM transaksi_detail td
      JOIN transaksi t ON td.transaksi_id = t.id
      WHERE DATE(t.tanggal) BETWEEN ? AND ?
      GROUP BY td.nama_barang_snapshot
      ORDER BY total_terjual DESC
      LIMIT 5
    `, [startDate, endDate]);

    // 5. Transaction list in range
    const [transaksiList] = await pool.query(`
      SELECT t.*,
        COUNT(td.id) AS total_jenis_barang,
        SUM(td.jumlah) AS total_item
      FROM transaksi t
      LEFT JOIN transaksi_detail td ON t.id = td.transaksi_id
      WHERE DATE(t.tanggal) BETWEEN ? AND ?
      GROUP BY t.id
      ORDER BY t.tanggal DESC, t.id DESC
    `, [startDate, endDate]);

    // 6. Incoming goods list in range
    const [masukList] = await pool.query(`
      SELECT *
      FROM barang_masuk
      WHERE DATE(tanggal) BETWEEN ? AND ?
      ORDER BY tanggal DESC, id DESC
    `, [startDate, endDate]);

    res.json({
      success: true,
      period: {
        start_date: startDate,
        end_date: endDate
      },
      summary: {
        total_transaksi: trxSummary[0].total_transaksi || 0,
        total_pendapatan: parseFloat(trxSummary[0].total_pendapatan) || 0,
        total_modal: parseFloat(trxSummary[0].total_modal) || 0,
        total_laba_kotor: parseFloat(trxSummary[0].total_laba_kotor) || 0,
        total_barang_terjual: parseInt(soldSummary[0].total_barang_terjual) || 0,
        total_barang_masuk: parseInt(inflowSummary[0].total_barang_masuk) || 0,
        total_biaya_masuk: parseFloat(inflowSummary[0].total_biaya_masuk) || 0
      },
      top_products: topProducts,
      transaksi_list: transaksiList,
      masuk_list: masukList
    });
  } catch (error) {
    console.error('getLaporan error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghasilkan laporan harian.' });
  }
};
