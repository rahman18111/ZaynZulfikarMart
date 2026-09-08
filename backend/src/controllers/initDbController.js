import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const initDb = async (req, res) => {
  try {
    const isPg = pool.isPostgres;

    if (isPg) {
      // PostgreSQL / Supabase Schema
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          nama_lengkap VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'admin',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS kategori (
          id SERIAL PRIMARY KEY,
          nama_kategori VARCHAR(100) NOT NULL UNIQUE,
          keterangan VARCHAR(255) NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS barang (
          id SERIAL PRIMARY KEY,
          kode_barang VARCHAR(50) NOT NULL UNIQUE,
          nama_barang VARCHAR(150) NOT NULL,
          kategori_id INT NULL REFERENCES kategori(id) ON DELETE SET NULL,
          harga_beli NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          harga_jual NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          stok INT NOT NULL DEFAULT 0,
          stok_minimum INT NOT NULL DEFAULT 5,
          satuan VARCHAR(20) NOT NULL DEFAULT 'Pcs',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS barang_masuk (
          id SERIAL PRIMARY KEY,
          kode_masuk VARCHAR(50) NOT NULL UNIQUE,
          tanggal TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          total_item INT NOT NULL DEFAULT 0,
          total_biaya NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
          catatan TEXT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS barang_masuk_detail (
          id SERIAL PRIMARY KEY,
          barang_masuk_id INT NOT NULL REFERENCES barang_masuk(id) ON DELETE CASCADE,
          barang_id INT NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
          jumlah INT NOT NULL,
          harga_beli NUMERIC(12, 2) NOT NULL,
          subtotal NUMERIC(14, 2) NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS transaksi (
          id SERIAL PRIMARY KEY,
          kode_transaksi VARCHAR(50) NOT NULL UNIQUE,
          tanggal TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          total_belanja NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
          total_modal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
          laba_kotor NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
          uang_bayar NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
          kembalian NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
          metode_bayar VARCHAR(30) DEFAULT 'Tunai',
          nama_pelanggan VARCHAR(100) DEFAULT 'Pelanggan Umum',
          catatan TEXT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS transaksi_detail (
          id SERIAL PRIMARY KEY,
          transaksi_id INT NOT NULL REFERENCES transaksi(id) ON DELETE CASCADE,
          barang_id INT NULL REFERENCES barang(id) ON DELETE SET NULL,
          nama_barang_snapshot VARCHAR(150) NOT NULL,
          harga_jual NUMERIC(12, 2) NOT NULL,
          harga_beli NUMERIC(12, 2) NOT NULL,
          jumlah INT NOT NULL,
          subtotal NUMERIC(14, 2) NOT NULL,
          laba NUMERIC(14, 2) NOT NULL
        );
      `);
    } else {
      // MySQL / XAMPP Schema
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          nama_lengkap VARCHAR(100) NOT NULL,
          role ENUM('admin') DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS kategori (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nama_kategori VARCHAR(100) NOT NULL UNIQUE,
          keterangan VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS barang (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_barang VARCHAR(50) NOT NULL UNIQUE,
          nama_barang VARCHAR(150) NOT NULL,
          kategori_id INT NULL,
          harga_beli DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
          harga_jual DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
          stok INT NOT NULL DEFAULT 0,
          stok_minimum INT NOT NULL DEFAULT 5,
          satuan VARCHAR(20) NOT NULL DEFAULT 'Pcs',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS barang_masuk (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_masuk VARCHAR(50) NOT NULL UNIQUE,
          tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
          total_item INT NOT NULL DEFAULT 0,
          total_biaya DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
          catatan TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS barang_masuk_detail (
          id INT AUTO_INCREMENT PRIMARY KEY,
          barang_masuk_id INT NOT NULL,
          barang_id INT NOT NULL,
          jumlah INT NOT NULL,
          harga_beli DECIMAL(12, 2) NOT NULL,
          subtotal DECIMAL(14, 2) NOT NULL,
          FOREIGN KEY (barang_masuk_id) REFERENCES barang_masuk(id) ON DELETE CASCADE,
          FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS transaksi (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_transaksi VARCHAR(50) NOT NULL UNIQUE,
          tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
          total_belanja DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
          total_modal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
          laba_kotor DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
          uang_bayar DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
          kembalian DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
          metode_bayar ENUM('Tunai', 'QRIS', 'Transfer') DEFAULT 'Tunai',
          nama_pelanggan VARCHAR(100) DEFAULT 'Pelanggan Umum',
          catatan TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS transaksi_detail (
          id INT AUTO_INCREMENT PRIMARY KEY,
          transaksi_id INT NOT NULL,
          barang_id INT NULL,
          nama_barang_snapshot VARCHAR(150) NOT NULL,
          harga_jual DECIMAL(12, 2) NOT NULL,
          harga_beli DECIMAL(12, 2) NOT NULL,
          jumlah INT NOT NULL,
          subtotal DECIMAL(14, 2) NOT NULL,
          laba DECIMAL(14, 2) NOT NULL,
          FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
          FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;
      `);
    }

    // Admin user default
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', ['ZaynZulfi23']);
    if (users.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('#Arafat23', salt);
      await pool.query(
        'INSERT INTO users (username, password_hash, nama_lengkap, role) VALUES (?, ?, ?, ?)',
        ['ZaynZulfi23', hash, 'Zayn Zulfikar', 'admin']
      );
    }

    // Categories
    const [kats] = await pool.query('SELECT COUNT(*) as count FROM kategori');
    const katCount = parseInt(kats[0].count, 10) || 0;
    if (katCount === 0) {
      await pool.query(`
        INSERT INTO kategori (nama_kategori, keterangan) VALUES
        ('Makanan & Camilan', 'Aneka makanan ringan, biskuit, dan mie instan'),
        ('Minuman Dingin & Segar', 'Air mineral, kopi botol, soda, jus'),
        ('Sembako & Bahan Pokok', 'Beras, minyak goreng, gula, tepung, telur'),
        ('Kebutuhan Rumah & Mandi', 'Sabun, sampo, detergen, sikat gigi'),
        ('Rokok & Tembakau', 'Aneka rokok dan perlengkapannya')
      `);
    }

    // Initial products
    const [barangs] = await pool.query('SELECT COUNT(*) as count FROM barang');
    const barangCount = parseInt(barangs[0].count, 10) || 0;
    if (barangCount === 0) {
      const [kategoriRows] = await pool.query('SELECT id, nama_kategori FROM kategori');
      const getKatId = (name) => {
        const found = kategoriRows.find(k => k.nama_kategori.toLowerCase().includes(name.toLowerCase()));
        return found ? found.id : null;
      };

      const initialBarang = [
        ['BRG001', 'Minyak Goreng Sania 2L', getKatId('Sembako'), 32000, 36000, 24, 6, 'Pouch'],
        ['BRG002', 'Beras Ramos Super 5kg', getKatId('Sembako'), 68000, 75000, 15, 5, 'Sak'],
        ['BRG003', 'Gula Pasir Gulaku 1kg', getKatId('Sembako'), 16000, 18500, 30, 8, 'Pcs'],
        ['BRG004', 'Indomie Goreng Spesial', getKatId('Makanan'), 2700, 3200, 80, 20, 'Bks'],
        ['BRG005', 'Indomie Kuah Ayam Bawang', getKatId('Makanan'), 2700, 3200, 65, 15, 'Bks'],
        ['BRG006', 'Le Minerale 600ml', getKatId('Minuman'), 2500, 3500, 48, 12, 'Btl'],
        ['BRG007', 'Kopi Good Day Cappuccino Botol', getKatId('Minuman'), 5800, 7500, 24, 8, 'Btl'],
        ['BRG008', 'Teh Botol Sosro 350ml', getKatId('Minuman'), 3200, 4500, 36, 10, 'Btl'],
        ['BRG009', 'Sabun Mandi Lifebuoy Total 10', getKatId('Kebutuhan'), 3800, 5000, 20, 5, 'Batang'],
        ['BRG010', 'Deterjen Rinso Molto 770g', getKatId('Kebutuhan'), 18500, 22000, 12, 4, 'Bks'],
        ['BRG011', 'Shampoo Pantene 160ml', getKatId('Kebutuhan'), 21000, 26000, 4, 5, 'Btl'],
        ['BRG012', 'Telur Ayam Ras 1kg', getKatId('Sembako'), 26000, 29000, 0, 5, 'Kg']
      ];

      for (const b of initialBarang) {
        await pool.query(
          'INSERT INTO barang (kode_barang, nama_barang, kategori_id, harga_beli, harga_jual, stok, stok_minimum, satuan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          b
        );
      }
    }

    res.json({
      success: true,
      engine: isPg ? 'Supabase (PostgreSQL)' : 'MySQL (XAMPP)',
      message: `Database (${isPg ? 'Supabase' : 'MySQL'}) berhasil diinisialisasi! Tabel, user admin ZaynZulfi23, kategori, dan barang awal siap digunakan.`
    });
  } catch (error) {
    console.error('Error initDb:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal inisialisasi database: ' + error.message
    });
  }
};
