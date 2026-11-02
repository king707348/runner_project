const db = require('../db');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    trigger: row.trigger,
    operatorId: row.operator_id,
    status: row.status,
    sourceName: row.source_name,
    fetchedCount: row.fetched_count,
    submittedCount: row.submitted_count,
    failureReason: row.failure_reason,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
  };
}

class CrawlJobRepository {
  async createCrawlJob(data, executor = db) {
    const {
      trigger = 'MANUAL',
      operatorId = null,
      status,
      sourceName = '運動筆記',
      fetchedCount = 0,
      submittedCount = 0,
      failureReason = null,
      startedAt = new Date(),
      finishedAt = new Date(),
    } = data;

    const sql = `
      INSERT INTO crawl_jobs (
        trigger, operator_id, status, source_name,
        fetched_count, submitted_count, failure_reason,
        started_at, finished_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const params = [
      trigger,
      operatorId,
      status,
      sourceName,
      fetchedCount,
      submittedCount,
      failureReason,
      startedAt,
      finishedAt,
    ];

    const { rows } = await executor.query(sql, params);
    return mapRow(rows[0]);
  }

  async findCrawlJobById(id, executor = db) {
    const { rows } = await executor.query(
      'SELECT * FROM crawl_jobs WHERE id = $1',
      [id],
    );
    return mapRow(rows[0]);
  }

  async findRecentCrawlJobs(limit = 20, executor = db) {
    const { rows } = await executor.query(
      'SELECT * FROM crawl_jobs ORDER BY created_at DESC LIMIT $1',
      [limit],
    );
    return rows.map(mapRow);
  }

  async updateCrawlJob(id, fields, executor = db) {
    const fieldMapping = {
      status: 'status',
      sourceName: 'source_name',
      fetchedCount: 'fetched_count',
      submittedCount: 'submitted_count',
      failureReason: 'failure_reason',
      finishedAt: 'finished_at',
    };

    const updates = [];
    const params = [];

    for (const [key, column] of Object.entries(fieldMapping)) {
      if (fields[key] !== undefined) {
        params.push(fields[key]);
        updates.push(`${column} = $${params.length}`);
      }
    }

    if (updates.length === 0) {
      return this.findCrawlJobById(id, executor);
    }

    params.push(id);
    const sql = `
      UPDATE crawl_jobs
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const { rows } = await executor.query(sql, params);
    return mapRow(rows[0]);
  }
}

module.exports = {
  CrawlJobRepository,
  crawlJobRepository: new CrawlJobRepository(),
  mapRow,
};
