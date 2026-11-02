const { EntitySchema } = require('typeorm');

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
    category: {
      type: 'enum',
      enum: ['MARATHON', 'ROAD_RUN', 'TRAIL', 'RELAY'],
    },
    county: {
      type: 'varchar',
      length: 30,
    },
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
    event_date: {
      type: 'date',
    },
    registration_start: {
      type: 'date',
      nullable: true,
    },
    registration_end: {
      type: 'date',
    },
    registration_url: {
      type: 'varchar',
      length: 500,
    },
    cover_url: {
      type: 'varchar',
      length: 500,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    distance_km: {
      type: 'numeric',
      precision: 6,
      scale: 2,
    },
    division_name: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    fee_ntd: {
      type: 'int',
      nullable: true,
    },
    start_time: {
      type: 'time',
      nullable: true,
    },
    status: {
      type: 'enum',
      enum: ['PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED', 'CANCELLED'],
      default: 'PENDING',
    },
    source: {
      type: 'enum',
      enum: ['MANUAL', 'MANUAL_CRAWL', 'SCHEDULED_CRAWL'],
      default: 'MANUAL_CRAWL',
    },
    source_name: {
      type: 'varchar',
      length: 50,
      default: '運動筆記',
    },
    source_url: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    fingerprint: {
      type: 'varchar',
      length: 100,
      nullable: true,
      unique: true,
    },
    created_by: {
      type: 'bigint',
      nullable: true,
    },
    updated_by: {
      type: 'bigint',
      nullable: true,
    },
    submitted_at: {
      type: 'timestamptz',
    },
    published_at: {
      type: 'timestamptz',
      nullable: true,
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
    },
    updated_at: {
      type: 'timestamptz',
      updateDate: true,
    },
  },
});

module.exports = { EventSchema };
