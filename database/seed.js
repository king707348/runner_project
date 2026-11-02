const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runSeeds() {
  console.log('🌱 [Seeder] 開始灌入測試種子資料...');
  const client = await pool.connect();
  try {
    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`📄 [Seeder] 正在執行: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ [Seeder] 成功灌入: ${file}`);
    }

    console.log('🎉 [Seeder] 測試資料建立完畢！');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [Seeder] 建立測試資料失敗，已復原交易:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };
