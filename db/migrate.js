const { AppDataSource } = require('./data-source');

/**
 * 執行所有尚未套用的資料庫遷移。
 * 可直接以 node db/migrate.js 執行，失敗時以結束碼 1 離開。
 */
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

// 僅在直接執行此檔時才自動跑遷移；被 require 時只提供函式
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
