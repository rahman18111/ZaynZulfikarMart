import pool from '../config/db.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Total products
    const [prodRows] = await pool.query('SELECT COUNT(*) AS total_produk FROM barang');

    // 2. Today's transactions & revenue
    const [todayTrx] = await pool.query(`
      SELECT 
        COUNT(id) AS transaksi_hari_ini,
        COALESCE(SUM(total_belanja), 0) AS pendapatan_hari_ini,
        COALESCE(SUM(laba_kotor), 0) AS laba_hari_ini
      FROM transaksi
      WHERE DATE(tanggal) = ?
    `, [today]);

    // 3. Low stock and out of stock count
    const [stockRows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN stok <= stok_minimum AND stok > 0 THEN 1 ELSE 0 END) AS stok_menipis,
        SUM(CASE WHEN stok = 0 THEN 1 ELSE 0 END) AS stok_habis
      FROM barang
    `);

    // 4. Critical stock alert items (top 5 lowest)
    const [criticalItems] = await pool.query(`
      SELECT b.id, b.kode_barang, b.nama_barang, b.stok, b.stok_minimum, b.satuan, k.nama_kategori
      FROM barang b
      LEFT JOIN kategori k ON b.kategori_id = k.id
      WHERE b.stok <= b.stok_minimum
      ORDER BY b.stok ASC
      LIMIT 6
    `);

    // 5. Recent 5 transactions
    const [recentTrx] = await pool.query(`
      SELECT id, kode_transaksi, tanggal, total_belanja, metode_bayar, nama_pelanggan
      FROM transaksi
      ORDER BY tanggal DESC, id DESC
      LIMIT 5
    `);

    // 6. Last 7 Days Revenue Trend
    const [weeklyTrend] = await pool.query(`
      SELECT 
        DATE(tanggal) AS tanggal,
        COUNT(id) AS total_transaksi,
        COALESCE(SUM(total_belanja), 0) AS total_pendapatan
      FROM transaksi
      WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(tanggal)
      ORDER BY DATE(tanggal) ASC
    `);

    res.json({
      success: true,
      data: {
        total_produk: prodRows[0].total_produk || 0,
        transaksi_hari_ini: todayTrx[0].transaksi_hari_ini || 0,
        pendapatan_hari_ini: parseFloat(todayTrx[0].pendapatan_hari_ini) || 0,
        laba_hari_ini: parseFloat(todayTrx[0].laba_hari_ini) || 0,
        stok_menipis: parseInt(stockRows[0].stok_menipis) || 0,
        stok_habis: parseInt(stockRows[0].stok_habis) || 0,
        critical_items: criticalItems,
        recent_transactions: recentTrx,
        weekly_trend: weeklyTrend
      }
    });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat ringkasan dashboard.' });
  }
};
