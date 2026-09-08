import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Otomatis aktifkan SSL jika host adalah Cloud (seperti TiDB Cloud / Aiven)
const isLocalhost = !process.env.DB_HOST || 
                    process.env.DB_HOST === '127.0.0.1' || 
                    process.env.DB_HOST === 'localhost';

const useSsl = process.env.DB_SSL === 'true' || (!isLocalhost && process.env.DB_SSL !== 'false');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zayn_zulfikar_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  ssl: useSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined
});

export default pool;
