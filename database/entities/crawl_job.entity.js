const { EntitySchema } = require('typeorm');

const CrawlJobSchema = new EntitySchema({
  name: 'CrawlJob',
  tableName: 'crawl_jobs',
  columns: {
    id: {
      primary: true,
      type: 'bigint',
      generated: 'identity',
    },
    trigger: {
      type: 'enum',
      enum: ['MANUAL', 'SCHEDULED'],
      default: 'MANUAL',
    },
    operator_id: {
      type: 'bigint',
      nullable: true,
    },
    status: {
      type: 'enum',
      enum: ['SUCCESS', 'NO_NEW', 'FAILED'],
    },
    source_name: {
      type: 'varchar',
      length: 50,
      default: '運動筆記',
    },
    fetched_count: {
      type: 'int',
      default: 0,
    },
    submitted_count: {
      type: 'int',
      default: 0,
    },
    failure_reason: {
      type: 'text',
      nullable: true,
    },
    started_at: {
      type: 'timestamptz',
    },
    finished_at: {
      type: 'timestamptz',
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
    },
  },
});

module.exports = { CrawlJobSchema };
