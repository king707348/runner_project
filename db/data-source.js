require('reflect-metadata');
const path = require('path');
const { DataSource } = require('typeorm');
require('dotenv').config();

const logger = require('../src/utils/logger');
const { UserSchema, EventSchema, CrawlJobSchema } = require('./entities');

function createDataSourceConfig() {
  const baseConfig = {
    type: 'postgres',
    entities: [UserSchema, EventSchema, CrawlJobSchema],
    migrations: [path.join(__dirname, 'migrations/*.js')],
    migrationsTableName: 'migrations',
    synchronize: false,
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

const AppDataSource = new DataSource(createDataSourceConfig());

async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    logger.info('[TypeORM] 資料庫連線已成功初始化');
  }
  return AppDataSource;
}

async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('[TypeORM] 資料庫連線已關閉');
  }
}

function getUserRepository() {
  return AppDataSource.getRepository(UserSchema);
}

function getEventRepository() {
  return AppDataSource.getRepository(EventSchema);
}

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
