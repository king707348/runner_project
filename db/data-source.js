// TypeORM 資料來源設定：集中管理連線、Entity、Migration 與 Repository 取得方式
require('reflect-metadata');
const path = require('path');
const { DataSource } = require('typeorm');
require('dotenv').config();

const logger = require('../src/utils/logger');
const { UserSchema, EventSchema, CrawlJobSchema } = require('./entities');

/**
 * 依環境變數組出 DataSource 設定。
 * 優先使用 DATABASE_URL；未設定時改用個別的 DB_* 變數（皆有本機開發預設值）。
 * @returns {import('typeorm').DataSourceOptions}
 */
function createDataSourceConfig() {
  const baseConfig = {
    type: 'postgres',
    entities: [UserSchema, EventSchema, CrawlJobSchema],
    migrations: [path.join(__dirname, 'migrations/*.js')],
    migrationsTableName: 'migrations',
    // 禁止自動同步結構，資料表異動一律透過 migration 管理
    synchronize: false,
    // 僅開發環境印出 SQL
    logging: process.env.NODE_ENV === 'development',
  };

  if (process.env.DATABASE_URL) {
    return {
      ...baseConfig,
      url: process.env.DATABASE_URL,
    };
  }

  return {
    ...baseConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'pacer_user',
    password: process.env.DB_PASSWORD || 'pacer_secret',
    database: process.env.DB_NAME || 'pacer_db',
  };
}

// 全專案共用的 DataSource 單例
const AppDataSource = new DataSource(createDataSourceConfig());

/**
 * 初始化資料庫連線（已初始化時不會重複連線）。
 * @returns {Promise<import('typeorm').DataSource>}
 */
async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    logger.info('[TypeORM] 資料庫連線已成功初始化');
  }
  return AppDataSource;
}

/**
 * 關閉資料庫連線（未連線時不做任何事）。
 */
async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('[TypeORM] 資料庫連線已關閉');
  }
}

/**
 * 取得使用者 Repository。
 */
function getUserRepository() {
  return AppDataSource.getRepository(UserSchema);
}

/**
 * 取得賽事 Repository。
 */
function getEventRepository() {
  return AppDataSource.getRepository(EventSchema);
}

/**
 * 取得爬蟲任務 Repository。
 */
function getCrawlJobRepository() {
  return AppDataSource.getRepository(CrawlJobSchema);
}

module.exports = {
  AppDataSource,
  initializeDatabase,
  closeDatabase,
  getUserRepository,
  getEventRepository,
  getCrawlJobRepository,
};
