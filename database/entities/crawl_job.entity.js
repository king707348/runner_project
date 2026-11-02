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
      enumName: 'crawl_trigger',
      default: 'MANUAL',
    },
    status: {
      type: 'enum',
      enum: ['SUCCESS', 'NO_NEW', 'FAILED'],
      enumName: 'crawl_status',
    },
    sourceName: {
      name: 'source_name',
      type: 'varchar',
      length: 50,
      default: '運動筆記',
    },
    fetchedCount: {
      name: 'fetched_count',
      type: 'int',
      default: 0,
    },
    submittedCount: {
      name: 'submitted_count',
      type: 'int',
      default: 0,
    },
    failureReason: {
      name: 'failure_reason',
      type: 'text',
      nullable: true,
    },
    startedAt: {
      name: 'started_at',
      type: 'timestamptz',
    },
    finishedAt: {
      name: 'finished_at',
      type: 'timestamptz',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
  },
  relations: {
    operator: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'operator_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
  indices: [
    {
      name: 'idx_crawl_jobs_created_at',
      columns: ['created_at'],
    },
  ],
});

module.exports = { CrawlJobSchema };
