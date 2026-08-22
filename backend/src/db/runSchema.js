/**
 * Reads schema.sql and executes it against the configured PostgreSQL database.
 * Usage: node src/db/runSchema.js
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { pool } = require('./db');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✅  Schema applied successfully.');
  } catch (err) {
    console.error('❌  Schema error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
