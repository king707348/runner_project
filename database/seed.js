const fs = require('fs');
const path = require('path');
const { AppDataSource } = require('./dataSource');

async function runSeeds() {
  console.log('🌱 [Seeder] 開始透過 TypeORM 灌入測試種子資料...');
  try {
    await AppDataSource.initialize();

    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`📄 [Seeder] 正在執行: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // 避免 crawl_jobs 重複執行造成資料膨脹
      await AppDataSource.query(`
        DELETE FROM crawl_jobs WHERE source_name IN ('運動筆記', '伊貝特報名網');
      `);

      await AppDataSource.query(sql);
      console.log(`✅ [Seeder] 成功灌入: ${file}`);
    }

    console.log('🎉 [Seeder] 測試資料建立完畢！');
  } catch (err) {
    console.error('❌ [Seeder] 建立測試資料失敗:', err.message);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };
