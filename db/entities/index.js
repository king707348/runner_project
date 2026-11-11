// Entity 統一匯出入口，供 DataSource 與 Repository 引用
const { UserSchema } = require('./user.entity');
const { EventSchema } = require('./event.entity');
const { CrawlJobSchema } = require('./crawl_job.entity');

module.exports = {
  UserSchema,
  EventSchema,
  CrawlJobSchema,
};
