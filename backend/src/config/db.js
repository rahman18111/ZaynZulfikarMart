import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Deteksi apakah menggunakan Supabase / PostgreSQL atau MySQL
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
const isPostgres = Boolean(
  databaseUrl.startsWith('postgres://') ||
  databaseUrl.startsWith('postgresql://') ||
  process.env.DB_TYPE === 'postgres' ||
  (process.env.DB_HOST && (process.env.DB_HOST.includes('supabase.co') || process.env.DB_HOST.includes('pooler.supabase.com'))) ||
  parseInt(process.env.DB_PORT, 10) === 5432 ||
  parseInt(process.env.DB_PORT, 10) === 6543
);

let pool;

if (isPostgres) {
  console.log('🐘 Menggunakan Database Engine: PostgreSQL / Supabase');
  const { default: pg } = await import('pg');
  const { Pool } = pg;

  const pgConfig = databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'postgres',
        ssl: { rejectUnauthorized: false }
      };

  const pgPool = new Pool({
    ...pgConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  // Helper untuk mengubah query MySQL (?) ke PostgreSQL ($1, $2, ...)
  const transformSql = (sql) => {
    let idx = 1;
    let transformed = sql.replace(/\?/g, () => `$${idx++}`);
    // Replace MySQL DATE_SUB(CURDATE(), INTERVAL X DAY) ke PostgreSQL
    transformed = transformed.replace(/DATE_SUB\(CURDATE\(\),\s*INTERVAL\s*(\d+)\s*DAY\)/gi, "CURRENT_DATE - INTERVAL '$1 days'");
    // Jika INSERT tanpa RETURNING, tambahkan RETURNING id
    if (/^\s*INSERT\s+INTO/i.test(transformed) && !/RETURNING/i.test(transformed)) {
      transformed += ' RETURNING id';
    }
    return transformed;
  };

  pool = {
    isPostgres: true,
    query: async (sql, params = []) => {
      const transformedSql = transformSql(sql);
      const res = await pgPool.query(transformedSql, params);

      if (/^\s*INSERT\s+INTO/i.test(sql)) {
        const insertId = res.rows.length > 0 && res.rows[0].id ? res.rows[0].id : null;
        return [{ insertId, affectedRows: res.rowCount, rowCount: res.rowCount }, res.fields];
      } else if (/^\s*(UPDATE|DELETE)\s+/i.test(sql)) {
        return [{ affectedRows: res.rowCount, rowCount: res.rowCount }, res.fields];
      } else {
        return [res.rows, res.fields];
      }
    },
    execute: async (sql, params = []) => {
      return pool.query(sql, params);
    },
    getConnection: async () => {
      const client = await pgPool.connect();
      return {
        query: async (sql, params = []) => {
          const transformedSql = transformSql(sql);
          const res = await client.query(transformedSql, params);
          if (/^\s*INSERT\s+INTO/i.test(sql)) {
            const insertId = res.rows.length > 0 && res.rows[0].id ? res.rows[0].id : null;
            return [{ insertId, affectedRows: res.rowCount, rowCount: res.rowCount }, res.fields];
          } else if (/^\s*(UPDATE|DELETE)\s+/i.test(sql)) {
            return [{ affectedRows: res.rowCount, rowCount: res.rowCount }, res.fields];
          } else {
            return [res.rows, res.fields];
          }
        },
        beginTransaction: async () => {
          await client.query('BEGIN');
        },
        commit: async () => {
          await client.query('COMMIT');
        },
        rollback: async () => {
          await client.query('ROLLBACK');
        },
        release: () => {
          client.release();
        }
      };
    },
    end: () => pgPool.end()
  };
} else {
  console.log('🐬 Menggunakan Database Engine: MySQL / XAMPP');
  const { default: mysql } = await import('mysql2/promise');

  const isLocalhost = !process.env.DB_HOST || 
                      process.env.DB_HOST === '127.0.0.1' || 
                      process.env.DB_HOST === 'localhost';

  const useSsl = process.env.DB_SSL === 'true' || (!isLocalhost && process.env.DB_SSL !== 'false');

  const mysqlPool = mysql.createPool({
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

  pool = mysqlPool;
  pool.isPostgres = false;
}

export default pool;
