import pool from '../config/db.js';

// Create Transaction (POS Checkout) with atomic stock decrement
export const createTransaksi = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { items, uang_bayar, metode_bayar, nama_pelanggan, catatan } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Keranjang belanja tidak boleh kosong.' });
    }

    await connection.beginTransaction();

    let totalBelanja = 0;
    let totalModal = 0;
    const validatedItems = [];

    // Check stock and gather current prices
    for (const item of items) {
      const qty = parseInt(item.jumlah);
      if (!item.barang_id || isNaN(qty) || qty <= 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Item keranjang tidak valid.' });
      }

      // Query with FOR UPDATE to prevent race conditions in concurrent POS sales
      const [rows] = await connection.query(
        'SELECT id, kode_barang, nama_barang, harga_beli, harga_jual, stok, satuan FROM barang WHERE id = ? FOR UPDATE',
        [item.barang_id]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: `Barang dengan ID ${item.barang_id} tidak ditemukan.` });
      }

      const product = rows[0];
      if (product.stok < qty) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok "${product.nama_barang}" tidak mencukupi! Tersedia: ${product.stok} ${product.satuan}, diminta: ${qty} ${product.satuan}.`
        });
      }

      const hargaJual = parseFloat(product.harga_jual);
      const hargaBeli = parseFloat(product.harga_beli);
      const subtotal = qty * hargaJual;
      const subtotalModal = qty * hargaBeli;
      const laba = subtotal - subtotalModal;

      totalBelanja += subtotal;
      totalModal += subtotalModal;

      validatedItems.push({
        barang_id: product.id,
        nama_barang: product.nama_barang,
        satuan: product.satuan,
        harga_jual: hargaJual,
        harga_beli: hargaBeli,
        jumlah: qty,
        subtotal,
        laba
      });
    }

    const labaKotor = totalBelanja - totalModal;
    const nominalBayar = parseFloat(uang_bayar) || 0;

    if (metode_bayar === 'Tunai' && nominalBayar < totalBelanja) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Uang bayar kurang! Total belanja: Rp ${totalBelanja.toLocaleString('id-ID')}, dibayar: Rp ${nominalBayar.toLocaleString('id-ID')}.`
      });
    }

    const kembalian = metode_bayar === 'Tunai' ? Math.max(0, nominalBayar - totalBelanja) : 0;

    // Generate unique transaction code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [countRow] = await connection.query(
      'SELECT COUNT(*) as count FROM transaksi WHERE kode_transaksi LIKE ?',
      [`TRX-${dateStr}-%`]
    );
    const seq = String(countRow[0].count + 1).padStart(4, '0');
    const kode_transaksi = `TRX-${dateStr}-${seq}`;

    // 1. Insert header
    const [trxResult] = await connection.query(
      `INSERT INTO transaksi (kode_transaksi, tanggal, total_belanja, total_modal, laba_kotor, uang_bayar, kembalian, metode_bayar, nama_pelanggan, catatan)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kode_transaksi,
        totalBelanja,
        totalModal,
        labaKotor,
        nominalBayar >= totalBelanja ? nominalBayar : totalBelanja,
        kembalian,
        metode_bayar || 'Tunai',
        nama_pelanggan ? nama_pelanggan.trim() : 'Pelanggan Umum',
        catatan || null
      ]
    );

    const transaksiId = trxResult.insertId;

    // 2. Insert detail & decrement stock
    for (const vItem of validatedItems) {
      await connection.query(
        `INSERT INTO transaksi_detail (transaksi_id, barang_id, nama_barang_snapshot, harga_jual, harga_beli, jumlah, subtotal, laba)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [transaksiId, vItem.barang_id, vItem.nama_barang, vItem.harga_jual, vItem.harga_beli, vItem.jumlah, vItem.subtotal, vItem.laba]
      );

      // Decrement stock
      await connection.query(
        'UPDATE barang SET stok = stok - ?, updated_at = NOW() WHERE id = ?',
        [vItem.jumlah, vItem.barang_id]
      );
    }

    await connection.commit();

    // Fetch full receipt data
    const [receipt] = await pool.query(
      'SELECT * FROM transaksi WHERE id = ?',
      [transaksiId]
    );

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil diproses dan stok barang otomatis berkurang.',
      data: {
        ...receipt[0],
        items: validatedItems
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('createTransaksi error:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses transaksi kasir.' });
  } finally {
    connection.release();
  }
};

// Get transaction list
export const getTransaksi = async (req, res) => {
  try {
    const { start_date, end_date, metode_bayar, q, limit } = req.query;

    let query = `
      SELECT t.*, 
        COUNT(td.id) AS total_jenis_barang,
        SUM(td.jumlah) AS total_item_terjual
      FROM transaksi t
      LEFT JOIN transaksi_detail td ON t.id = td.transaksi_id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      query += ` AND DATE(t.tanggal) >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND DATE(t.tanggal) <= ?`;
      params.push(end_date);
    }
    if (metode_bayar) {
      query += ` AND t.metode_bayar = ?`;
      params.push(metode_bayar);
    }
    if (q) {
      query += ` AND (t.kode_transaksi LIKE ? OR t.nama_pelanggan LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    query += ` GROUP BY t.id ORDER BY t.tanggal DESC, t.id DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit));
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getTransaksi error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat transaksi.' });
  }
};

// Get single transaction receipt detail
export const getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;

    const [headerRows] = await pool.query('SELECT * FROM transaksi WHERE id = ?', [id]);
    if (headerRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }

    const [detailRows] = await pool.query(`
      SELECT td.*, b.satuan, b.kode_barang
      FROM transaksi_detail td
      LEFT JOIN barang b ON td.barang_id = b.id
      WHERE td.transaksi_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...headerRows[0],
        items: detailRows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail struk transaksi.' });
  }
};
