const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { UserSchema, EventSchema, CrawlJobSchema } = require('../../db/entities');
const { AppDataSource } = require('../../db/data-source');
const { userRepository } = require('../../src/repositories/user.repository');
const { eventRepository } = require('../../src/repositories/event.repository');
const { crawlJobRepository } = require('../../src/repositories/crawl_job.repository');

// 單元測試：驗證 Entity 定義、DataSource 設定與 Repository 行為（不需連線真實資料庫）
describe('TypeORM EntitySchema tests', () => {
  it('defines UserSchema with correct columns, enumName, and hidden select fields', () => {
    assert.equal(UserSchema.options.name, 'User');
    assert.equal(UserSchema.options.tableName, 'users');

    const columns = UserSchema.options.columns;
    assert.ok(columns.id.primary);
    assert.equal(columns.id.generated, 'identity');
    assert.equal(columns.email.unique, true);

    // camelCase property maps to snake_case column
    assert.equal(columns.passwordHash.name, 'password_hash');
    assert.equal(columns.passwordHash.select, false);

    assert.equal(columns.encryptedRefreshToken.name, 'encrypted_refresh_token');
    assert.equal(columns.encryptedRefreshToken.select, false);

    assert.equal(columns.role.type, 'enum');
    assert.equal(columns.role.enumName, 'user_role');
    assert.deepEqual(columns.role.enum, ['USER', 'ADMIN']);

    assert.equal(columns.authProvider.name, 'auth_provider');
    assert.equal(columns.authProvider.enumName, 'auth_provider');
  });

  it('defines EventSchema with relations, enumNames, indices, and distance transformer', () => {
    assert.equal(EventSchema.options.name, 'Event');
    assert.equal(EventSchema.options.tableName, 'events');

    const columns = EventSchema.options.columns;
    assert.ok(columns.id.primary);
    assert.equal(columns.category.enumName, 'event_category');
    assert.equal(columns.status.enumName, 'event_status');
    assert.equal(columns.source.enumName, 'event_source');

    // Transformer check
    assert.equal(columns.distanceKm.name, 'distance_km');
    assert.equal(columns.distanceKm.transformer.from('42.195'), 42.195);
    assert.equal(columns.distanceKm.transformer.from(null), null);

    // Relations check
    const relations = EventSchema.options.relations;
    assert.ok(relations.creator);
    assert.equal(relations.creator.type, 'many-to-one');
    assert.equal(relations.creator.target, 'User');
    assert.equal(relations.creator.joinColumn.name, 'created_by');

    assert.ok(relations.updater);
    assert.equal(relations.updater.type, 'many-to-one');
    assert.equal(relations.updater.target, 'User');
    assert.equal(relations.updater.joinColumn.name, 'updated_by');

    // Indices check
    const indices = EventSchema.options.indices;
    const statusRegEndIdx = indices.find((idx) => idx.name === 'idx_events_status_reg_end');
    assert.ok(statusRegEndIdx);
    assert.deepEqual(statusRegEndIdx.columns, ['status', 'registrationEnd']);

    const countyDateIdx = indices.find((idx) => idx.name === 'idx_events_county_date');
    assert.ok(countyDateIdx);
    assert.deepEqual(countyDateIdx.columns, ['county', 'eventDate']);

    const distanceIdx = indices.find((idx) => idx.name === 'idx_events_distance');
    assert.ok(distanceIdx);
    assert.deepEqual(distanceIdx.columns, ['distanceKm']);
  });

  it('defines CrawlJobSchema with operator relation, enumNames, and index', () => {
    assert.equal(CrawlJobSchema.options.name, 'CrawlJob');
    assert.equal(CrawlJobSchema.options.tableName, 'crawl_jobs');

    const columns = CrawlJobSchema.options.columns;
    assert.ok(columns.id.primary);
    assert.equal(columns.trigger.enumName, 'crawl_trigger');
    assert.equal(columns.status.enumName, 'crawl_status');
    assert.equal(columns.sourceName.name, 'source_name');

    // Relations check
    const relations = CrawlJobSchema.options.relations;
    assert.ok(relations.operator);
    assert.equal(relations.operator.type, 'many-to-one');
    assert.equal(relations.operator.target, 'User');
    assert.equal(relations.operator.joinColumn.name, 'operator_id');

    // Index check
    const indices = CrawlJobSchema.options.indices;
    const createdAtIdx = indices.find((idx) => idx.name === 'idx_crawl_jobs_created_at');
    assert.ok(createdAtIdx);
    assert.deepEqual(createdAtIdx.columns, ['createdAt']);
  });

  it('configures AppDataSource with PostgreSQL driver, migrations, and entity schemas', () => {
    assert.equal(AppDataSource.options.type, 'postgres');
    assert.equal(AppDataSource.options.synchronize, false);
    assert.equal(AppDataSource.options.migrationsTableName, 'migrations');
    assert.ok(Array.isArray(AppDataSource.options.entities));
    assert.equal(AppDataSource.options.entities.length, 3);
    assert.ok(Array.isArray(AppDataSource.options.migrations));
  });

  // buildMetadatas 只解析結構、不連線，可提早發現欄位或索引對應錯誤
  it('builds entity metadatas without schema or index mapping errors', async () => {
    await AppDataSource.buildMetadatas();
    assert.equal(AppDataSource.entityMetadatas.length, 3);

    const eventMetadata = AppDataSource.getMetadata(EventSchema);
    const regEndIdx = eventMetadata.indices.find((idx) => idx.name === 'idx_events_status_reg_end');
    assert.ok(regEndIdx);
    assert.deepEqual(regEndIdx.columns.map((c) => c.databaseName), ['status', 'registration_end']);

    const crawlJobMetadata = AppDataSource.getMetadata(CrawlJobSchema);
    const crawlJobIdx = crawlJobMetadata.indices.find((idx) => idx.name === 'idx_crawl_jobs_created_at');
    assert.ok(crawlJobIdx);
    assert.deepEqual(crawlJobIdx.columns.map((c) => c.databaseName), ['created_at']);
  });

  it('allows repositories to operate with a custom or mock manager', async () => {
    // 以假的 manager 取代資料庫，驗證 Repository 會使用傳入的 manager
    const mockRepo = {
      create: (data) => ({ id: '1', ...data }),
      save: async (entity) => ({ ...entity, saved: true }),
      findOneBy: async (criteria) => ({ id: criteria.id, email: 'runner@pacer.com' }),
    };

    const mockManager = {
      getRepository: () => mockRepo,
    };

    const created = await userRepository.createUser({ email: 'new@pacer.com', nickname: 'Test' }, mockManager);
    assert.equal(created.id, '1');
    assert.equal(created.saved, true);

    const found = await userRepository.findUserById('1', mockManager);
    assert.equal(found.id, '1');
    assert.equal(found.email, 'runner@pacer.com');
  });
});
