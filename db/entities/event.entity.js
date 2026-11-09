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
      enumName: 'event_category',
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
    eventDate: {
      name: 'event_date',
      type: 'date',
    },
    registrationStart: {
      name: 'registration_start',
      type: 'date',
      nullable: true,
    },
    registrationEnd: {
      name: 'registration_end',
      type: 'date',
    },
    registrationUrl: {
      name: 'registration_url',
      type: 'varchar',
      length: 500,
    },
    coverUrl: {
      name: 'cover_url',
      type: 'varchar',
      length: 500,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    distanceKm: {
      name: 'distance_km',
      type: 'numeric',
      precision: 6,
      scale: 2,
      transformer: {
        to: (value) => value,
        from: (value) => (value === null || value === undefined ? null : parseFloat(value)),
      },
    },
    divisionName: {
      name: 'division_name',
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    feeNtd: {
      name: 'fee_ntd',
      type: 'int',
      nullable: true,
    },
    startTime: {
      name: 'start_time',
      type: 'time',
      nullable: true,
    },
    status: {
      type: 'enum',
      enum: ['PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED', 'CANCELLED'],
      enumName: 'event_status',
      default: 'PENDING',
    },
    source: {
      type: 'enum',
      enum: ['MANUAL', 'MANUAL_CRAWL', 'SCHEDULED_CRAWL'],
      enumName: 'event_source',
      default: 'MANUAL_CRAWL',
    },
    sourceName: {
      name: 'source_name',
      type: 'varchar',
      length: 50,
      nullable: true,
      default: '運動筆記',
    },
    sourceUrl: {
      name: 'source_url',
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
    submittedAt: {
      name: 'submitted_at',
      type: 'timestamptz',
      default: () => 'NOW()',
    },
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
    creator: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'created_by' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    updater: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'updated_by' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
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
