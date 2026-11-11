const { EntitySchema } = require('typeorm');

/**
 * 爬蟲任務紀錄資料表 crawl_jobs，記錄每次爬蟲的執行結果。
 */
const CrawlJobSchema = new EntitySchema({
  name: 'CrawlJob',
  tableName: 'crawl_jobs',
  columns: {
    id: {
      primary: true,
      type: 'bigint',
      generated: 'identity',
    },
    // 觸發方式：MANUAL 手動 / SCHEDULED 排程
    trigger: {
      type: 'enum',
      enum: ['MANUAL', 'SCHEDULED'],
      enumName: 'crawl_trigger',
      default: 'MANUAL',
    },
    // 執行結果：SUCCESS 成功 / NO_NEW 無新資料 / FAILED 失敗
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
    // 本次抓取到的筆數
    fetchedCount: {
      name: 'fetched_count',
      type: 'int',
      default: 0,
    },
    // 本次實際送審（新增）的筆數
    submittedCount: {
      name: 'submitted_count',
      type: 'int',
      default: 0,
    },
    // 失敗原因（僅失敗時有值）
    failureReason: {
      name: 'failure_reason',
      type: 'text',
      nullable: true,
    },
    // 開始執行時間
    startedAt: {
      name: 'started_at',
      type: 'timestamptz',
    },
    // 結束執行時間
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
    // 操作者；排程觸發時為 NULL，使用者被刪除時也設為 NULL
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
      columns: ['createdAt'],
    },
  ],
});

module.exports = { CrawlJobSchema };
