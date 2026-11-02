const { pool } = require('./connection');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  console.log('⚠️ [Reset] 正在重置本地資料庫（DROP ALL TABLES）...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 清除既有表格
    await client.query(`
      DROP TABLE IF EXISTS crawl_jobs CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS event_divisions CASCADE;
      DROP TABLE IF EXISTS user_oauth_accounts CASCADE;
      DROP TABLE IF EXISTS user_security_logs CASCADE;
      DROP TABLE IF EXISTS user_daily_metrics CASCADE;
      DROP TABLE IF EXISTS user_training_activities CASCADE;
    `);

    console.log('🧹 [Reset] 既有表格已清除！');

    // 重新跑 migration
    const migrationsDir = path.join(__dirname, 'migrations');
    const migFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of migFiles) {
      console.log(`📄 [Migration] 正在套用: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query(sql);
    }
    console.log('✅ [Reset] Schema 重建成功！');

    // 重新跑 seeds
    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of seedFiles) {
      console.log(`🌱 [Seeder] 正在灌入: ${file}`);
      const sql = fs.readFileSync(path.join(seedsDir, file), 'utf-8');
      await client.query(sql);
    }
    console.log('✅ [Reset] 測試種子資料灌入成功！');

    await client.query('COMMIT');
    console.log('🎉 [Reset] 資料庫重置完全成功！');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [Reset] 重置失敗:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };
