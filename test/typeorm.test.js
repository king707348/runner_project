const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { UserSchema, EventSchema, CrawlJobSchema } = require('../database/entities');
const { AppDataSource } = require('../database/dataSource');

describe('TypeORM EntitySchema tests', () => {
  it('defines UserSchema with correct table and column mappings', () => {
    assert.equal(UserSchema.options.name, 'User');
    assert.equal(UserSchema.options.tableName, 'users');

    const columns = UserSchema.options.columns;
    assert.ok(columns.id.primary);
    assert.equal(columns.id.generated, 'identity');
    assert.equal(columns.email.unique, true);
    assert.equal(columns.role.type, 'enum');
    assert.deepEqual(columns.role.enum, ['USER', 'ADMIN']);
  });

  it('defines EventSchema with correct table and column mappings', () => {
    assert.equal(EventSchema.options.name, 'Event');
    assert.equal(EventSchema.options.tableName, 'events');

    const columns = EventSchema.options.columns;
    assert.ok(columns.id.primary);
    assert.equal(columns.category.type, 'enum');
    assert.deepEqual(columns.category.enum, ['MARATHON', 'ROAD_RUN', 'TRAIL', 'RELAY']);
    assert.equal(columns.distance_km.type, 'numeric');
  });

  it('defines CrawlJobSchema with correct table and column mappings', () => {
    assert.equal(CrawlJobSchema.options.name, 'CrawlJob');
    assert.equal(CrawlJobSchema.options.tableName, 'crawl_jobs');

    const columns = CrawlJobSchema.options.columns;
    assert.ok(columns.id.primary);
    assert.deepEqual(columns.status.enum, ['SUCCESS', 'NO_NEW', 'FAILED']);
  });

  it('configures AppDataSource with PostgreSQL driver and entity schemas', () => {
    assert.equal(AppDataSource.options.type, 'postgres');
    assert.equal(AppDataSource.options.synchronize, false);
    assert.ok(Array.isArray(AppDataSource.options.entities));
    assert.equal(AppDataSource.options.entities.length, 3);
  });
});
