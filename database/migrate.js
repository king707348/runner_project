const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runMigrations() {
  console.log('🚀 [Migration] 開始執行資料庫遷移...');
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`📄 [Migration] 正在套用: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ [Migration] 成功套用: ${file}`);
    }

    console.log('🎉 [Migration] 所有資料表結構遷移完成！');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [Migration] 遷移失敗，已復原交易:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
