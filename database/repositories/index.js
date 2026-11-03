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
} = require('../dataSource');

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
