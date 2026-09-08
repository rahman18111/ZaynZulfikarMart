import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDatabase() {
  console.log('🔄 Menghubungkan ke MySQL XAMPP...');
  
  // Connect without database selected first
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'zayn_zulfikar_store';
  console.log(`📦 Menyiapkan database: ${dbName}...`);
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();

  // Connect to the specific database
  const dbConn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    multipleStatements: true
  });

  console.log('📜 Menjalankan skema database...');
  const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf-8');
  await dbConn.query(schemaSql);

  // Check admin user
  const [users] = await dbConn.query('SELECT * FROM users WHERE username = ?', ['ZaynZulfi23']);
  if (users.length === 0) {
    console.log('👤 Membuat user admin default (username: ZaynZulfi23, password: #Arafat23)...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('#Arafat23', salt);
    await dbConn.query(
      'INSERT INTO users (username, password_hash, nama_lengkap, role) VALUES (?, ?, ?, ?)',
      ['ZaynZulfi23', hash, 'Zayn Zulfikar', 'admin']
    );
  }

  // Check categories
  const [kats] = await dbConn.query('SELECT COUNT(*) as count FROM kategori');
  if (kats[0].count === 0) {
    console.log('🏷️ Menambahkan kategori contoh...');
    await dbConn.query(`
      INSERT INTO kategori (nama_kategori, keterangan) VALUES
      ('Makanan & Camilan', 'Aneka makanan ringan, biskuit, dan mie instan'),
      ('Minuman Dingin & Segar', 'Air mineral, kopi botol, soda, jus'),
      ('Sembako & Bahan Pokok', 'Beras, minyak goreng, gula, tepung, telur'),
      ('Kebutuhan Rumah & Mandi', 'Sabun, sampo, detergen, sikat gigi'),
      ('Rokok & Tembakau', 'Aneka rokok dan perlengkapannya')
    `);
  }

  // Check initial products
  const [barangs] = await dbConn.query('SELECT COUNT(*) as count FROM barang');
  if (barangs[0].count === 0) {
    console.log('🛒 Menambahkan data barang awal...');
    // Fetch category IDs
    const [kategoriRows] = await dbConn.query('SELECT id, nama_kategori FROM kategori');
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
      ['BRG011', 'Shampoo Pantene 160ml', getKatId('Kebutuhan'), 21000, 26000, 4, 5, 'Btl'], // Stok menipis (4 <= 5)
      ['BRG012', 'Telur Ayam Ras 1kg', getKatId('Sembako'), 26000, 29000, 0, 5, 'Kg']      // Stok habis (0)
    ];

    for (const b of initialBarang) {
      await dbConn.query(
        'INSERT INTO barang (kode_barang, nama_barang, kategori_id, harga_beli, harga_jual, stok, stok_minimum, satuan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        b
      );
    }
  }

  await dbConn.end();
  console.log('✅ Inisialisasi Database ZaynZulfikarStore berhasil!');
}

initDatabase().catch(err => {
  console.error('❌ Terjadi kesalahan inisialisasi database:', err);
  process.exit(1);
});
