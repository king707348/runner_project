const db = require('./db');

module.exports = {
  pool: db.pool,
  getPool: db.getPool,
  query: db.query,
  exec: db.exec,
  withTransaction: db.withTransaction,
};
