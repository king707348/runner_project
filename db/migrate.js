const { AppDataSource } = require('./data-source');

async function runMigrations() {
  console.log('🚀 [Migration] 開始透過 TypeORM 執行資料庫遷移...');
  try {
    await AppDataSource.initialize();
    const migrations = await AppDataSource.runMigrations();
    console.log(`🎉 [Migration] 成功套用 ${migrations.length} 個遷移檔案！`);
    migrations.forEach((m) => console.log(`  - ${m.name}`));
  } catch (err) {
    console.error('❌ [Migration] 遷移失敗:', err.message);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
