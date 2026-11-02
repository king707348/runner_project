const db = require('../db');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    passwordHash: row.password_hash,
    role: row.role,
    authProvider: row.auth_provider,
    hasOauth: row.has_oauth,
    oauthProvider: row.oauth_provider,
    oauthId: row.oauth_id,
    oauthEmail: row.oauth_email,
    encryptedRefreshToken: row.encrypted_refresh_token,
    tokenExpiresAt: row.token_expires_at,
    needsReauth: row.needs_reauth,
    mustChangePassword: row.must_change_password,
    tokenVersion: row.token_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class UserRepository {
  async createUser(data, executor = db) {
    const {
      email,
      nickname,
      passwordHash = null,
      role = 'USER',
      authProvider = 'PASSWORD',
      hasOauth = false,
      oauthProvider = null,
      oauthId = null,
      oauthEmail = null,
      encryptedRefreshToken = null,
      tokenExpiresAt = null,
      needsReauth = false,
      mustChangePassword = false,
      tokenVersion = 1,
    } = data;

    const sql = `
      INSERT INTO users (
        email, nickname, password_hash, role, auth_provider,
        has_oauth, oauth_provider, oauth_id, oauth_email,
        encrypted_refresh_token, token_expires_at, needs_reauth,
        must_change_password, token_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const params = [
      email,
      nickname,
      passwordHash,
      role,
      authProvider,
      hasOauth,
      oauthProvider,
      oauthId,
      oauthEmail,
      encryptedRefreshToken,
      tokenExpiresAt,
      needsReauth,
      mustChangePassword,
      tokenVersion,
    ];

    const { rows } = await executor.query(sql, params);
    return mapRow(rows[0]);
  }

  async findUserById(id, executor = db) {
    const { rows } = await executor.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return mapRow(rows[0]);
  }

  async findUserByEmail(email, executor = db) {
    const { rows } = await executor.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return mapRow(rows[0]);
  }

  async findUserByOAuth(oauthProvider, oauthId, executor = db) {
    const { rows } = await executor.query(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      [oauthProvider, oauthId],
    );
    return mapRow(rows[0]);
  }

  async getUsers({ role } = {}, executor = db) {
    let sql = 'SELECT * FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = $1';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await executor.query(sql, params);
    return rows.map(mapRow);
  }

  async updateUser(id, fields, executor = db) {
    const fieldMapping = {
      nickname: 'nickname',
      passwordHash: 'password_hash',
      role: 'role',
      authProvider: 'auth_provider',
      hasOauth: 'has_oauth',
      oauthProvider: 'oauth_provider',
      oauthId: 'oauth_id',
      oauthEmail: 'oauth_email',
      encryptedRefreshToken: 'encrypted_refresh_token',
      tokenExpiresAt: 'token_expires_at',
      needsReauth: 'needs_reauth',
      mustChangePassword: 'must_change_password',
      tokenVersion: 'token_version',
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
      return this.findUserById(id, executor);
    }

    params.push(id);
    const sql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const { rows } = await executor.query(sql, params);
    return mapRow(rows[0]);
  }

  async deleteUser(id, executor = db) {
    const { rows } = await executor.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id],
    );
    return mapRow(rows[0]);
  }
}

module.exports = {
  UserRepository,
  userRepository: new UserRepository(),
  mapRow,
};
