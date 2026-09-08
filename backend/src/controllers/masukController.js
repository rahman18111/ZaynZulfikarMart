import pool from '../config/db.js';

// Create Barang Masuk (Restock Langsung Input Manual)
export const createBarangMasuk = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { nama_barang, jumlah, harga_beli, harga_jual, satuan } = req.body;

    if (!nama_barang || !nama_barang.trim()) {
      return res.status(400).json({ success: false, message: 'Nama barang wajib diisi.' });
    }

    const qty = parseInt(jumlah);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Jumlah barang masuk harus lebih dari 0.' });
    }

    const buyPrice = parseFloat(harga_beli) || 0;
    const sellPrice = parseFloat(harga_jual) || 0;
    const satuanStr = satuan && satuan.trim() ? satuan.trim() : 'Pcs';
    const cleanNama = nama_barang.trim();

    await connection.beginTransaction();

    // 1. Cek apakah barang sudah ada di katalog
    const [existing] = await connection.query(
      'SELECT * FROM barang WHERE LOWER(nama_barang) = LOWER(?)',
      [cleanNama]
    );

    let barangId;
    let kodeBarang;

    if (existing.length > 0) {
      // Barang sudah ada -> Update stok, harga beli, dan harga jual
      barangId = existing[0].id;
      kodeBarang = existing[0].kode_barang;

      await connection.query(
        `UPDATE barang 
         SET stok = stok + ?, 
             harga_beli = ?, 
             harga_jual = ?, 
             satuan = ?,
             updated_at = NOW() 
         WHERE id = ?`,
        [qty, buyPrice, sellPrice > 0 ? sellPrice : existing[0].harga_jual, satuanStr, barangId]
      );
    } else {
      // Barang baru -> Buat kode otomatis dan insert ke tabel barang
      const [lastRow] = await connection.query('SELECT id FROM barang ORDER BY id DESC LIMIT 1');
      const nextId = (lastRow.length > 0 ? lastRow[0].id : 0) + 1;
      kodeBarang = 'BRG' + String(nextId).padStart(4, '0');

      const [newBarangResult] = await connection.query(
        `INSERT INTO barang (kode_barang, nama_barang, harga_beli, harga_jual, stok, stok_minimum, satuan)
         VALUES (?, ?, ?, ?, ?, 5, ?)`,
        [kodeBarang, cleanNama, buyPrice, sellPrice, qty, satuanStr]
      );
      barangId = newBarangResult.insertId;
    }

    // 2. Generate kode masuk
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [countRow] = await connection.query(
      `SELECT COUNT(*) as count FROM barang_masuk WHERE kode_masuk LIKE ?`,
      [`IN-${dateStr}-%`]
    );
    const seq = String(countRow[0].count + 1).padStart(4, '0');
    const kode_masuk = `IN-${dateStr}-${seq}`;

    const subtotalBiaya = qty * buyPrice;

    // 3. Simpan Header Barang Masuk
    const [headerResult] = await connection.query(
      `INSERT INTO barang_masuk (kode_masuk, tanggal, total_item, total_biaya)
       VALUES (?, NOW(), ?, ?)`,
      [kode_masuk, qty, subtotalBiaya]
    );
    const masukId = headerResult.insertId;

    // 4. Simpan Detail Barang Masuk
    await connection.query(
      `INSERT INTO barang_masuk_detail (barang_masuk_id, barang_id, jumlah, harga_beli, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [masukId, barangId, qty, buyPrice, subtotalBiaya]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Barang "${cleanNama}" sebanyak ${qty} ${satuanStr} berhasil dimasukkan! Stok bertambah otomatis.`,
      data: {
        id: masukId,
        kode_masuk,
        barang_id: barangId,
        kode_barang: kodeBarang,
        nama_barang: cleanNama,
        jumlah: qty,
        harga_beli: buyPrice,
        harga_jual: sellPrice,
        total_biaya: subtotalBiaya
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('createBarangMasuk error:', error);
    res.status(500).json({ success: false, message: 'Gagal mencatat barang masuk.' });
  } finally {
    connection.release();
  }
};

// Get Barang Masuk History beserta rincian nama barangnya
export const getBarangMasuk = async (req, res) => {
  try {
    const query = `
      SELECT 
        bm.id,
        bm.kode_masuk,
        bm.tanggal,
        bm.total_item,
        bm.total_biaya,
        b.nama_barang,
        b.kode_barang,
        b.satuan,
        b.harga_jual,
        bmd.harga_beli,
        bmd.jumlah,
        bmd.subtotal
      FROM barang_masuk bm
      LEFT JOIN barang_masuk_detail bmd ON bm.id = bmd.barang_masuk_id
      LEFT JOIN barang b ON bmd.barang_id = b.id
      ORDER BY bm.tanggal DESC, bm.id DESC
    `;

    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getBarangMasuk error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat barang masuk.' });
  }
};

// Get single detail
export const getBarangMasukById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT bm.*, bmd.jumlah, bmd.harga_beli, bmd.subtotal, b.nama_barang, b.kode_barang, b.satuan, b.harga_jual
      FROM barang_masuk bm
      JOIN barang_masuk_detail bmd ON bm.id = bmd.barang_masuk_id
      JOIN barang b ON bmd.barang_id = b.id
      WHERE bm.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data barang masuk tidak ditemukan.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail barang masuk.' });
  }
};
