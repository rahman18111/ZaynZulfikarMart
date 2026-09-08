import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function updateUser() {
  console.log('🔄 Memperbarui user admin ke ZaynZulfi23...');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zayn_zulfikar_store'
  });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('#Arafat23', salt);

  // Clear existing users and insert new admin
  await conn.query('DELETE FROM users;');
  await conn.query(
    'INSERT INTO users (username, password_hash, nama_lengkap, role) VALUES (?, ?, ?, ?)',
    ['ZaynZulfi23', hash, 'Zayn Zulfikar', 'admin']
  );

  console.log('✅ User admin berhasil diperbarui!');
  console.log('👤 Username: ZaynZulfi23');
  console.log('🔑 Password: #Arafat23');

  await conn.end();
}

updateUser().catch(err => {
  console.error('Gagal memperbarui user:', err);
  process.exit(1);
});
