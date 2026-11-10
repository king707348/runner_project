const { EntitySchema } = require('typeorm');

/**
 * 賽事資料表 events。
 * 資料可能來自人工建立或爬蟲匯入，需經審核（status）後才會公開。
 */
const EventSchema = new EntitySchema({
  name: 'Event',
  tableName: 'events',
  columns: {
    id: {
      primary: true,
      type: 'bigint',
      generated: 'identity',
    },
    name: {
      type: 'varchar',
      length: 150,
    },
    // 賽事類型：MARATHON 馬拉松 / ROAD_RUN 路跑 / TRAIL 越野 / RELAY 接力
    category: {
      type: 'enum',
      enum: ['MARATHON', 'ROAD_RUN', 'TRAIL', 'RELAY'],
      enumName: 'event_category',
    },
    // 縣市
    county: {
      type: 'varchar',
      length: 30,
    },
    // 鄉鎮市區
    district: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    venue: {
      type: 'varchar',
      length: 150,
    },
    organizer: {
      type: 'varchar',
      length: 150,
    },
    // 賽事舉辦日期
    eventDate: {
      name: 'event_date',
      type: 'date',
    },
    // 報名開始日期
    registrationStart: {
      name: 'registration_start',
      type: 'date',
      nullable: true,
    },
    // 報名截止日期
    registrationEnd: {
      name: 'registration_end',
      type: 'date',
    },
    // 報名頁面網址
    registrationUrl: {
      name: 'registration_url',
      type: 'varchar',
      length: 500,
    },
    // 封面圖片網址
    coverUrl: {
      name: 'cover_url',
      type: 'varchar',
      length: 500,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    // 距離（公里）
    distanceKm: {
      name: 'distance_km',
      type: 'numeric',
      precision: 6,
      scale: 2,
      // PostgreSQL 的 numeric 會以字串回傳，讀出時轉成 number；寫入則維持原值
      transformer: {
        to: (value) => value,
        from: (value) => (value === null || value === undefined ? null : parseFloat(value)),
      },
    },
    // 組別名稱
    divisionName: {
      name: 'division_name',
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    // 報名費（新台幣）
    feeNtd: {
      name: 'fee_ntd',
      type: 'int',
      nullable: true,
    },
    // 起跑時間
    startTime: {
      name: 'start_time',
      type: 'time',
      nullable: true,
    },
    // 狀態：PENDING 待審核 / PUBLISHED 已上架 / REJECTED 已退回 / CLOSED 已截止 / CANCELLED 已取消
    status: {
      type: 'enum',
      enum: ['PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED', 'CANCELLED'],
      enumName: 'event_status',
      default: 'PENDING',
    },
    // 資料來源：MANUAL 人工建立 / MANUAL_CRAWL 手動觸發爬蟲 / SCHEDULED_CRAWL 排程爬蟲
    source: {
      type: 'enum',
      enum: ['MANUAL', 'MANUAL_CRAWL', 'SCHEDULED_CRAWL'],
      enumName: 'event_source',
      default: 'MANUAL_CRAWL',
    },
    // 來源網站名稱
    sourceName: {
      name: 'source_name',
      type: 'varchar',
      length: 50,
      nullable: true,
      default: '運動筆記',
    },
    // 來源網站上的原始網址
    sourceUrl: {
      name: 'source_url',
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    // 爬蟲資料的指紋（唯一），用來判斷是否為重複賽事
    fingerprint: {
      type: 'varchar',
      length: 100,
      nullable: true,
      unique: true,
    },
    // 送審時間
    submittedAt: {
      name: 'submitted_at',
      type: 'timestamptz',
      default: () => 'NOW()',
    },
    // 上架時間
    publishedAt: {
      name: 'published_at',
      type: 'timestamptz',
      nullable: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
  relations: {
    // 建立者；使用者被刪除時設為 NULL，保留賽事資料
    creator: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'created_by' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    // 最後更新者；使用者被刪除時設為 NULL
    updater: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'updated_by' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
  // 索引：對應常見查詢（依狀態與報名截止日、縣市與日期、距離篩選）
  indices: [
    {
      name: 'idx_events_status_reg_end',
      columns: ['status', 'registrationEnd'],
    },
    {
      name: 'idx_events_county_date',
      columns: ['county', 'eventDate'],
    },
    {
      name: 'idx_events_distance',
      columns: ['distanceKm'],
    },
  ],
});

module.exports = { EventSchema };
