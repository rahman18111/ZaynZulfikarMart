import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function resetAllData() {
  console.log('🧹 Mengosongkan data transaksi, barang masuk, dan barang...');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zayn_zulfikar_store',
    multipleStatements: true
  });

  // Disable foreign key checks to truncate safely
  await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
  await conn.query('TRUNCATE TABLE transaksi_detail;');
  await conn.query('TRUNCATE TABLE transaksi;');
  await conn.query('TRUNCATE TABLE barang_masuk_detail;');
  await conn.query('TRUNCATE TABLE barang_masuk;');
  await conn.query('TRUNCATE TABLE barang;');
  // Also clear categories so user starts 100% clean
  await conn.query('TRUNCATE TABLE kategori;');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

  await conn.end();
  console.log('✅ Seluruh data sampel berhasil dikosongkan!');
  console.log('👤 Akun admin (admin / admin123) tetap aman tersimpan.');
}

resetAllData().catch(err => {
  console.error('Gagal mereset data:', err);
  process.exit(1);
});
