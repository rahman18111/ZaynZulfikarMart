import pool from '../config/db.js';

// Get Realtime Stock Monitoring & Metrics
export const getStokMonitoring = async (req, res) => {
  try {
    const { status, q, kategori_id } = req.query;

    // Metrics summary
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_produk,
        SUM(stok) AS total_unit_tersedia,
        SUM(CASE WHEN stok = 0 THEN 1 ELSE 0 END) AS produk_habis,
        SUM(CASE WHEN stok > 0 AND stok <= stok_minimum THEN 1 ELSE 0 END) AS produk_menipis,
        SUM(CASE WHEN stok > stok_minimum THEN 1 ELSE 0 END) AS produk_aman,
        COALESCE(SUM(stok * harga_beli), 0) AS total_aset_modal,
        COALESCE(SUM(stok * harga_jual), 0) AS estimasi_nilai_jual
      FROM barang
    `);

    // Detail product list with indicators
    let listQuery = `
      SELECT b.*, k.nama_kategori,
        CASE 
          WHEN b.stok = 0 THEN 'habis'
          WHEN b.stok <= b.stok_minimum THEN 'menipis'
          ELSE 'aman'
        END AS status_stok
      FROM barang b
      LEFT JOIN kategori k ON b.kategori_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      listQuery += ` AND (b.kode_barang LIKE ? OR b.nama_barang LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (kategori_id) {
      listQuery += ` AND b.kategori_id = ?`;
      params.push(kategori_id);
    }

    if (status === 'menipis') {
      listQuery += ` AND (b.stok > 0 AND b.stok <= b.stok_minimum)`;
    } else if (status === 'habis') {
      listQuery += ` AND b.stok = 0`;
    } else if (status === 'aman') {
      listQuery += ` AND b.stok > b.stok_minimum`;
    }

    listQuery += ` ORDER BY (b.stok <= b.stok_minimum) DESC, b.stok ASC, b.nama_barang ASC`;

    const [items] = await pool.query(listQuery, params);

    res.json({
      success: true,
      summary: summaryRows[0],
      data: items
    });
  } catch (error) {
    console.error('getStokMonitoring error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat monitoring stok.' });
  }
};

// Adjust stock manually (Opname / Koreksi fisik)
export const adjustStok = async (req, res) => {
  try {
    const { id } = req.params;
    const { stok_baru, catatan } = req.body;

    const stokInt = parseInt(stok_baru);
    if (isNaN(stokInt) || stokInt < 0) {
      return res.status(400).json({ success: false, message: 'Jumlah stok harus berupa angka positif.' });
    }

    const [current] = await pool.query('SELECT * FROM barang WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    const oldStok = current[0].stok;
    await pool.query(
      'UPDATE barang SET stok = ?, updated_at = NOW() WHERE id = ?',
      [stokInt, id]
    );

    res.json({
      success: true,
      message: `Stok "${current[0].nama_barang}" berhasil disesuaikan dari ${oldStok} menjadi ${stokInt} ${current[0].satuan}.`,
      data: {
        id,
        stok_sebelumnya: oldStok,
        stok_sekarang: stokInt,
        catatan: catatan || 'Penyesuaian stok manual oleh Admin'
      }
    });
  } catch (error) {
    console.error('adjustStok error:', error);
    res.status(500).json({ success: false, message: 'Gagal menyesuaikan stok.' });
  }
};
