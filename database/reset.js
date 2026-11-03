const { AppDataSource } = require('./dataSource');
const { runSeeds } = require('./seed');

async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('🚫 [Reset] 正式環境嚴禁執行資料庫重置操作！');
    process.exit(1);
  }

  console.log('⚠️ [Reset] 正在透過 TypeORM 重置本地開發資料庫...');
  try {
    await AppDataSource.initialize();

    await AppDataSource.dropDatabase();
    console.log('🧹 [Reset] 資料庫結構已清除！');

    const migrations = await AppDataSource.runMigrations();
    console.log(`✅ [Reset] 成功執行 ${migrations.length} 個遷移檔案！`);

    await AppDataSource.destroy();

    await runSeeds();
    console.log('🎉 [Reset] 本地資料庫重置完全成功！');
  } catch (err) {
    console.error('❌ [Reset] 重置失敗:', err.message);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };
