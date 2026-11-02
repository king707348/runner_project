const { Pool } = require('pg');
require('dotenv').config();

function maskPassword(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch {
    return '(無法解析連線字串)';
  }
}

let poolInstance = null;

function getPool() {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      poolInstance = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      console.log(`[DB] 連線目標: ${maskPassword(connectionString)}`);
    } else {
      poolInstance = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'pacer_user',
        password: process.env.DB_PASSWORD || 'pacer_secret',
        database: process.env.DB_NAME || 'pacer_db',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      console.log(`[DB] 連線目標: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pacer_db'}`);
    }

    poolInstance.on('error', (err) => {
      console.error('[DB] PostgreSQL 連線池異常:', err.message);
    });
  }

  return poolInstance;
}

async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}

async function exec(sql) {
  const pool = getPool();
  return pool.query(sql);
}

async function withTransaction(callback) {
  const pool = getPool();
  const client = await pool.connect();
  const transaction = {
    query: (text, params) => client.query(text, params),
  };

  try {
    await client.query('BEGIN');
    const result = await callback(transaction);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[DB] Transaction ROLLBACK 失敗:', rollbackError.message);
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getPool,
  get pool() {
    return getPool();
  },
  query,
  exec,
  withTransaction,
  maskPassword,
};
