const path = require('path');
const fs = require('fs');

let dbInstance = null;
const isPostgres = !!process.env.DATABASE_URL;

if (isPostgres) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  dbInstance = {
    type: 'postgres',
    async query(sql, params = []) {
      const res = await pool.query(sql, params);
      return res;
    },
    async get(sql, params = []) {
      const res = await pool.query(sql, params);
      return res.rows[0] || null;
    },
    async all(sql, params = []) {
      const res = await pool.query(sql, params);
      return res.rows;
    },
    async run(sql, params = []) {
      const res = await pool.query(sql, params);
      return {
        changes: res.rowCount,
        lastInsertRowid: res.rows && res.rows[0] ? res.rows[0].id : null
      };
    },
    async transaction(callback) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const txDb = {
          async query(sql, params = []) { return client.query(sql, params); },
          async get(sql, params = []) { const r = await client.query(sql, params); return r.rows[0] || null; },
          async all(sql, params = []) { const r = await client.query(sql, params); return r.rows; },
          async run(sql, params = []) {
            const r = await client.query(sql, params);
            return { changes: r.rowCount, lastInsertRowid: r.rows && r.rows[0] ? r.rows[0].id : null };
          }
        };
        const result = await callback(txDb);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  };
} else {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(__dirname, '../data/hospital.db');
  const sqlite = new Database(dbPath);

  // Enable WAL mode and foreign keys
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  // Convert $1, $2 parameter placeholders to ? if passed
  const normalizeSql = (sql) => sql.replace(/\$\d+/g, '?');

  dbInstance = {
    type: 'sqlite',
    raw: sqlite,
    async query(sql, params = []) {
      const cleanSql = normalizeSql(sql);
      const stmt = sqlite.prepare(cleanSql);
      if (cleanSql.trim().toUpperCase().startsWith('SELECT') || cleanSql.trim().toUpperCase().startsWith('PRAGMA')) {
        return { rows: stmt.all(...params) };
      } else {
        const info = stmt.run(...params);
        return { rowCount: info.changes, rows: [] };
      }
    },
    async get(sql, params = []) {
      const stmt = sqlite.prepare(normalizeSql(sql));
      const row = stmt.get(...params);
      return row || null;
    },
    async all(sql, params = []) {
      const stmt = sqlite.prepare(normalizeSql(sql));
      return stmt.all(...params);
    },
    async run(sql, params = []) {
      const stmt = sqlite.prepare(normalizeSql(sql));
      const info = stmt.run(...params);
      return {
        changes: info.changes,
        lastInsertRowid: Number(info.lastInsertRowid)
      };
    },
    async transaction(callback) {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const txDb = {
          get: (sql, params = []) => sqlite.prepare(normalizeSql(sql)).get(...params) || null,
          all: (sql, params = []) => sqlite.prepare(normalizeSql(sql)).all(...params),
          run: (sql, params = []) => {
            const info = sqlite.prepare(normalizeSql(sql)).run(...params);
            return { changes: info.changes, lastInsertRowid: Number(info.lastInsertRowid) };
          }
        };
        const result = await callback(txDb);
        sqlite.exec('COMMIT');
        return result;
      } catch (err) {
        try { sqlite.exec('ROLLBACK'); } catch (_) {}
        throw err;
      }
    }
  };
}

module.exports = dbInstance;
