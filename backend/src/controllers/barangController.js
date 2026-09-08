import pool from '../config/db.js';

// Get categories list
export const getKategori = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getKategori error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat kategori.' });
  }
};

// Add category
export const createKategori = async (req, res) => {
  try {
    const { nama_kategori, keterangan } = req.body;
    if (!nama_kategori || !nama_kategori.trim()) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
    }

    const [result] = await pool.query(
      'INSERT INTO kategori (nama_kategori, keterangan) VALUES (?, ?)',
      [nama_kategori.trim(), keterangan || null]
    );

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan.',
      data: { id: result.insertId, nama_kategori, keterangan }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Kategori dengan nama tersebut sudah ada.' });
    }
    res.status(500).json({ success: false, message: 'Gagal menambahkan kategori.' });
  }
};

// Get all products with search & filter
export const getBarang = async (req, res) => {
  try {
    const { q, kategori_id, status_stok, sort, order } = req.query;

    let query = `
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
      query += ` AND (b.kode_barang LIKE ? OR b.nama_barang LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (kategori_id) {
      query += ` AND b.kategori_id = ?`;
      params.push(kategori_id);
    }

    if (status_stok === 'menipis') {
      query += ` AND (b.stok > 0 AND b.stok <= b.stok_minimum)`;
    } else if (status_stok === 'habis') {
      query += ` AND b.stok = 0`;
    } else if (status_stok === 'aman') {
      query += ` AND b.stok > b.stok_minimum`;
    }

    // Sorting
    const allowedSort = ['nama_barang', 'kode_barang', 'harga_jual', 'stok', 'created_at'];
    const sortField = allowedSort.includes(sort) ? `b.${sort}` : 'b.id';
    const sortOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getBarang error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data barang.' });
  }
};

// Get single product
export const getBarangById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT b.*, k.nama_kategori FROM barang b LEFT JOIN kategori k ON b.kategori_id = k.id WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail barang.' });
  }
};

// Create product
export const createBarang = async (req, res) => {
  try {
    let { kode_barang, nama_barang, kategori_id, harga_beli, harga_jual, stok, stok_minimum, satuan } = req.body;

    if (!nama_barang || !nama_barang.trim()) {
      return res.status(400).json({ success: false, message: 'Nama barang wajib diisi.' });
    }

    // Auto-generate code if empty
    if (!kode_barang || !kode_barang.trim()) {
      const [lastRow] = await pool.query('SELECT id FROM barang ORDER BY id DESC LIMIT 1');
      const nextId = (lastRow.length > 0 ? lastRow[0].id : 0) + 1;
      kode_barang = 'BRG' + String(nextId).padStart(4, '0');
    } else {
      kode_barang = kode_barang.trim().toUpperCase();
    }

    const hargaBeliNum = parseFloat(harga_beli) || 0;
    const hargaJualNum = parseFloat(harga_jual) || 0;
    const stokNum = parseInt(stok) || 0;
    const stokMinNum = parseInt(stok_minimum) >= 0 ? parseInt(stok_minimum) : 5;
    const satuanStr = satuan ? satuan.trim() : 'Pcs';

    const [result] = await pool.query(
      `INSERT INTO barang (kode_barang, nama_barang, kategori_id, harga_beli, harga_jual, stok, stok_minimum, satuan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [kode_barang, nama_barang.trim(), kategori_id || null, hargaBeliNum, hargaJualNum, stokNum, stokMinNum, satuanStr]
    );

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan ke inventaris.',
      data: {
        id: result.insertId,
        kode_barang,
        nama_barang: nama_barang.trim(),
        kategori_id,
        harga_beli: hargaBeliNum,
        harga_jual: hargaJualNum,
        stok: stokNum,
        stok_minimum: stokMinNum,
        satuan: satuanStr
      }
    });
  } catch (error) {
    console.error('createBarang error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Kode barang sudah digunakan. Harap gunakan kode lain.' });
    }
    res.status(500).json({ success: false, message: 'Gagal menambahkan data barang.' });
  }
};

// Update product
export const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    let { kode_barang, nama_barang, kategori_id, harga_beli, harga_jual, stok, stok_minimum, satuan } = req.body;

    if (!nama_barang || !nama_barang.trim()) {
      return res.status(400).json({ success: false, message: 'Nama barang wajib diisi.' });
    }

    const hargaBeliNum = parseFloat(harga_beli) || 0;
    const hargaJualNum = parseFloat(harga_jual) || 0;
    const stokNum = parseInt(stok) || 0;
    const stokMinNum = parseInt(stok_minimum) >= 0 ? parseInt(stok_minimum) : 5;
    const satuanStr = satuan ? satuan.trim() : 'Pcs';
    const kodeStr = kode_barang ? kode_barang.trim().toUpperCase() : '';

    const [result] = await pool.query(
      `UPDATE barang 
       SET kode_barang = ?, nama_barang = ?, kategori_id = ?, harga_beli = ?, harga_jual = ?, stok = ?, stok_minimum = ?, satuan = ?, updated_at = NOW()
       WHERE id = ?`,
      [kodeStr, nama_barang.trim(), kategori_id || null, hargaBeliNum, hargaJualNum, stokNum, stokMinNum, satuanStr, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data barang berhasil diperbarui.'
    });
  } catch (error) {
    console.error('updateBarang error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Kode barang sudah digunakan oleh produk lain.' });
    }
    res.status(500).json({ success: false, message: 'Gagal memperbarui data barang.' });
  }
};

// Delete product
export const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if referenced in transactions
    const [trxRef] = await pool.query('SELECT COUNT(*) as count FROM transaksi_detail WHERE barang_id = ?', [id]);
    if (trxRef[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Barang ini tidak dapat dihapus karena sudah memiliki riwayat transaksi penjualan. Anda dapat mengubah stoknya menjadi 0 atau mengubah namanya.'
      });
    }

    const [masukRef] = await pool.query('SELECT COUNT(*) as count FROM barang_masuk_detail WHERE barang_id = ?', [id]);
    if (masukRef[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Barang ini tidak dapat dihapus karena terdapat riwayat barang masuk.'
      });
    }

    const [result] = await pool.query('DELETE FROM barang WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Barang berhasil dihapus.' });
  } catch (error) {
    console.error('deleteBarang error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus barang.' });
  }
};
