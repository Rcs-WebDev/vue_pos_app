import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bien_pos',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
  pool.getConnection().then(conn => {
    conn.release();
    isConnected = true;
    console.log('[MySQL] Berhasil terhubung ke database MySQL:', dbConfig.database);
  }).catch(err => {
    isConnected = false;
    console.warn('[MySQL Info] Server MySQL lokal belum aktif. Mode Standalone aktif!');
  });
} catch (err) {
  isConnected = false;
  console.warn('[MySQL Info] Mode Standalone aktif!');
}

export { pool, isConnected };
