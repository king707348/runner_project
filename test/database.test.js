const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { maskPassword } = require('../database/db');
const { userRepository, UserRepository, mapRow: mapUserRow } = require('../database/repositories/user.repository');
const { eventRepository, EventRepository, mapRow: mapEventRow } = require('../database/repositories/event.repository');
const { crawlJobRepository, CrawlJobRepository, mapRow: mapCrawlJobRow } = require('../database/repositories/crawl_job.repository');

function createMockExecutor(queryHandler) {
  return {
    calls: [],
    query: async function (text, params) {
      this.calls.push({ text, params });
      return queryHandler ? queryHandler(text, params) : { rows: [] };
    },
  };
}

describe('database/db utility tests', () => {
  it('masks database connection password in url', () => {
    const url = 'postgresql://admin:secretPass@localhost:5432/pacer_db';
    const masked = maskPassword(url);
    assert.ok(!masked.includes('secretPass'));
    assert.ok(masked.includes('****'));
  });

  it('handles invalid connection string safely', () => {
    assert.equal(maskPassword('invalid-uri'), '(無法解析連線字串)');
  });
});

describe('UserRepository tests', () => {
  it('maps snake_case columns to camelCase user object', () => {
    const row = {
      id: '1',
      email: 'test@example.com',
      nickname: 'RunnerOne',
      password_hash: 'hashed_pw',
      role: 'USER',
      auth_provider: 'PASSWORD',
      has_oauth: false,
      oauth_provider: null,
      oauth_id: null,
      oauth_email: null,
      encrypted_refresh_token: null,
      token_expires_at: null,
      needs_reauth: false,
      must_change_password: false,
      token_version: 1,
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    };

    const user = mapUserRow(row);
    assert.equal(user.id, '1');
    assert.equal(user.passwordHash, 'hashed_pw');
    assert.equal(user.authProvider, 'PASSWORD');
    assert.equal(user.hasOauth, false);
    assert.equal(user.tokenVersion, 1);
  });

  it('executes createUser with parameter array and custom executor', async () => {
    const mockExecutor = createMockExecutor(() => ({
      rows: [{
        id: '10',
        email: 'new@example.com',
        nickname: 'Speedy',
        password_hash: 'hash123',
        role: 'USER',
        auth_provider: 'PASSWORD',
        has_oauth: false,
        token_version: 1,
      }],
    }));

    const result = await userRepository.createUser({
      email: 'new@example.com',
      nickname: 'Speedy',
      passwordHash: 'hash123',
    }, mockExecutor);

    assert.equal(mockExecutor.calls.length, 1);
    assert.ok(mockExecutor.calls[0].text.includes('INSERT INTO users'));
    assert.equal(mockExecutor.calls[0].params[0], 'new@example.com');
    assert.equal(mockExecutor.calls[0].params[1], 'Speedy');
    assert.equal(result.id, '10');
    assert.equal(result.email, 'new@example.com');
  });

  it('finds user by email with parameterized query', async () => {
    const mockExecutor = createMockExecutor(() => ({
      rows: [{ id: '5', email: 'findme@example.com', nickname: 'Found' }],
    }));

    const user = await userRepository.findUserByEmail('findme@example.com', mockExecutor);
    assert.equal(mockExecutor.calls[0].params[0], 'findme@example.com');
    assert.equal(user.id, '5');
  });

  it('updates partial user fields accurately', async () => {
    const mockExecutor = createMockExecutor(() => ({
      rows: [{ id: '5', nickname: 'NewNick', token_version: 2 }],
    }));

    const updated = await userRepository.updateUser('5', {
      nickname: 'NewNick',
      tokenVersion: 2,
    }, mockExecutor);

    assert.ok(mockExecutor.calls[0].text.includes('nickname = $1, token_version = $2'));
    assert.equal(mockExecutor.calls[0].params[2], '5');
    assert.equal(updated.nickname, 'NewNick');
    assert.equal(updated.tokenVersion, 2);
  });
});

describe('EventRepository tests', () => {
  it('maps snake_case columns and converts distance_km to float', () => {
    const row = {
      id: '101',
      name: 'Taipei Marathon',
      category: 'MARATHON',
      county: '台北市',
      venue: '台北市政府前廣場',
      organizer: '中華民國路跑協會',
      event_date: '2026-12-20',
      registration_start: '2026-08-01',
      registration_end: '2026-09-30',
      registration_url: 'https://example.com/register',
      cover_url: 'https://example.com/cover.jpg',
      distance_km: '42.195',
      fee_ntd: 1800,
      status: 'PUBLISHED',
      source: 'MANUAL',
      source_name: '運動筆記',
    };

    const event = mapEventRow(row);
    assert.equal(event.id, '101');
    assert.equal(event.distanceKm, 42.195);
    assert.equal(event.registrationEnd, '2026-09-30');
    assert.equal(event.coverUrl, 'https://example.com/cover.jpg');
  });

  it('builds dynamic filter query for events', async () => {
    const mockExecutor = createMockExecutor(() => ({ rows: [] }));

    await eventRepository.findEvents({
      category: 'MARATHON',
      county: '台北市',
      status: 'PUBLISHED',
      minDistance: 21,
      search: 'Marathon',
      limit: 10,
      offset: 5,
    }, mockExecutor);

    const call = mockExecutor.calls[0];
    assert.ok(call.text.includes('category = $1'));
    assert.ok(call.text.includes('status = $2'));
    assert.ok(call.text.includes('county = $3'));
    assert.ok(call.text.includes('distance_km >= $4'));
    assert.ok(call.text.includes('ILIKE $5'));
    assert.ok(call.text.includes('LIMIT $6 OFFSET $7'));
    assert.deepEqual(call.params, ['MARATHON', 'PUBLISHED', '台北市', 21, '%Marathon%', 10, 5]);
  });
});

describe('CrawlJobRepository tests', () => {
  it('creates and maps crawl job fields', async () => {
    const mockExecutor = createMockExecutor(() => ({
      rows: [{
        id: '201',
        trigger: 'MANUAL',
        operator_id: '1',
        status: 'SUCCESS',
        source_name: '運動筆記',
        fetched_count: 50,
        submitted_count: 48,
        failure_reason: null,
      }],
    }));

    const job = await crawlJobRepository.createCrawlJob({
      trigger: 'MANUAL',
      operatorId: '1',
      status: 'SUCCESS',
      sourceName: '運動筆記',
      fetchedCount: 50,
      submittedCount: 48,
    }, mockExecutor);

    assert.equal(job.id, '201');
    assert.equal(job.operatorId, '1');
    assert.equal(job.fetchedCount, 50);
    assert.equal(job.submittedCount, 48);
  });
});

describe('Transaction composition test', () => {
  it('allows composing multiple repositories in a single transaction executor', async () => {
    const transactionLogs = [];
    const mockTx = {
      query: async (text, params) => {
        transactionLogs.push({ text, params });
        if (text.includes('INSERT INTO users')) {
          return { rows: [{ id: '99', email: 'tx@example.com', nickname: 'TxUser' }] };
        }
        if (text.includes('INSERT INTO crawl_jobs')) {
          return { rows: [{ id: '88', status: 'SUCCESS' }] };
        }
        return { rows: [] };
      },
    };

    const user = await userRepository.createUser({ email: 'tx@example.com', nickname: 'TxUser' }, mockTx);
    const job = await crawlJobRepository.createCrawlJob({ status: 'SUCCESS', operatorId: user.id }, mockTx);

    assert.equal(transactionLogs.length, 2);
    assert.equal(user.id, '99');
    assert.equal(job.id, '88');
  });
});
