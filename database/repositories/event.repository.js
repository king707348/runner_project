const db = require('../db');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    county: row.county,
    district: row.district,
    venue: row.venue,
    organizer: row.organizer,
    eventDate: row.event_date,
    registrationStart: row.registration_start,
    registrationEnd: row.registration_end,
    registrationUrl: row.registration_url,
    coverUrl: row.cover_url,
    description: row.description,
    distanceKm: row.distance_km !== null ? parseFloat(row.distance_km) : null,
    divisionName: row.division_name,
    feeNtd: row.fee_ntd,
    startTime: row.start_time,
    status: row.status,
    source: row.source,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    fingerprint: row.fingerprint,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    submittedAt: row.submitted_at,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class EventRepository {
  async createEvent(data, executor = db) {
    const {
      name,
      category,
      county,
      district = null,
      venue,
      organizer,
      eventDate,
      registrationStart = null,
      registrationEnd,
      registrationUrl,
      coverUrl,
      description = null,
      distanceKm,
      divisionName = null,
      feeNtd = null,
      startTime = null,
      status = 'PENDING',
      source = 'MANUAL_CRAWL',
      sourceName = '運動筆記',
      sourceUrl = null,
      fingerprint = null,
      createdBy = null,
      updatedBy = null,
      submittedAt = new Date(),
      publishedAt = null,
    } = data;

    const sql = `
      INSERT INTO events (
        name, category, county, district, venue, organizer,
        event_date, registration_start, registration_end, registration_url,
        cover_url, description, distance_km, division_name, fee_ntd,
        start_time, status, source, source_name, source_url,
        fingerprint, created_by, updated_by, submitted_at, published_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25
      )
      RETURNING *
    `;

    const params = [
      name,
      category,
      county,
      district,
      venue,
      organizer,
      eventDate,
      registrationStart,
      registrationEnd,
      registrationUrl,
      coverUrl,
      description,
      distanceKm,
      divisionName,
      feeNtd,
      startTime,
      status,
      source,
      sourceName,
      sourceUrl,
      fingerprint,
      createdBy,
      updatedBy,
      submittedAt,
      publishedAt,
    ];

    const { rows } = await executor.query(sql, params);
    return mapRow(rows[0]);
  }

  async findEventById(id, executor = db) {
    const { rows } = await executor.query(
      'SELECT * FROM events WHERE id = $1',
      [id],
    );
    return mapRow(rows[0]);
  }

  async findEventByFingerprint(fingerprint, executor = db) {
    const { rows } = await executor.query(
      'SELECT * FROM events WHERE fingerprint = $1',
      [fingerprint],
    );
    return mapRow(rows[0]);
  }

  async findEvents({
    category,
    status,
    county,
    startDate,
    endDate,
    minDistance,
    maxDistance,
    search,
    limit = 20,
    offset = 0,
  } = {}, executor = db) {
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (county) {
      params.push(county);
      sql += ` AND county = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      sql += ` AND event_date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      sql += ` AND event_date <= $${params.length}`;
    }

    if (minDistance !== undefined) {
      params.push(minDistance);
      sql += ` AND distance_km >= $${params.length}`;
    }

    if (maxDistance !== undefined) {
      params.push(maxDistance);
      sql += ` AND distance_km <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR venue ILIKE $${params.length} OR organizer ILIKE $${params.length})`;
    }

    params.push(limit);
    sql += ` ORDER BY event_date ASC LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const { rows } = await executor.query(sql, params);
    return rows.map(mapRow);
  }

  async updateEvent(id, fields, executor = db) {
    const fieldMapping = {
      name: 'name',
      category: 'category',
      county: 'county',
      district: 'district',
      venue: 'venue',
      organizer: 'organizer',
      eventDate: 'event_date',
      registrationStart: 'registration_start',
      registrationEnd: 'registration_end',
      registrationUrl: 'registration_url',
      coverUrl: 'cover_url',
      description: 'description',
      distanceKm: 'distance_km',
      divisionName: 'division_name',
      feeNtd: 'fee_ntd',
      startTime: 'start_time',
      status: 'status',
      source: 'source',
      sourceName: 'source_name',
      sourceUrl: 'source_url',
      fingerprint: 'fingerprint',
      updatedBy: 'updated_by',
      publishedAt: 'published_at',
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
      return this.findEventById(id, executor);
    }

    params.push(id);
    const sql = `
      UPDATE events
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const { rows } = await executor.query(sql, params);
    return mapRow(rows[0]);
  }

  async deleteEvent(id, executor = db) {
    const { rows } = await executor.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id],
    );
    return mapRow(rows[0]);
  }
}

module.exports = {
  EventRepository,
  eventRepository: new EventRepository(),
  mapRow,
};
