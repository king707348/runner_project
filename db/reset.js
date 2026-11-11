const { AppDataSource } = require('./data-source');
const { runSeeds } = require('./seed/init');

/**
 * 重置本機開發資料庫：清空結構 → 重新執行遷移 → 灌入種子資料。
 * 會刪除所有資料，因此正式環境一律禁止執行。
 */
async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('🚫 [Reset] 正式環境嚴禁執行資料庫重置操作！');
    process.exit(1);
  }

  console.log('⚠️ [Reset] 正在透過 TypeORM 重置本地開發資料庫...');
  try {
    await AppDataSource.initialize();

    // 清除所有資料表與型別
    await AppDataSource.dropDatabase();
    console.log('🧹 [Reset] 資料庫結構已清除！');

    const migrations = await AppDataSource.runMigrations();
    console.log(`✅ [Reset] 成功執行 ${migrations.length} 個遷移檔案！`);

    await AppDataSource.destroy();

    // runSeeds 會自行重新建立連線，因此上方先關閉連線
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

// 僅在直接執行此檔時才自動重置
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };
