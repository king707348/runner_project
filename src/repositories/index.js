/**
 * Repository 與資料庫連線的統一匯出入口。
 * 其他模組請由此引入，不要直接引用個別檔案。
 */
const { UserRepository, userRepository } = require('./user.repository');
const { EventRepository, eventRepository } = require('./event.repository');
const { CrawlJobRepository, crawlJobRepository } = require('./crawl_job.repository');
const {
  AppDataSource,
  initializeDatabase,
  closeDatabase,
  getUserRepository,
  getEventRepository,
  getCrawlJobRepository,
} = require('../../db/data-source');

module.exports = {
  UserRepository,
  userRepository,
  EventRepository,
  eventRepository,
  CrawlJobRepository,
  crawlJobRepository,
  AppDataSource,
  initializeDatabase,
  closeDatabase,
  getUserRepository,
  getEventRepository,
  getCrawlJobRepository,
};
