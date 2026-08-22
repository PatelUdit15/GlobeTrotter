/**
 * Runs a single SQL migration file.
 * Usage: node src/db/runMigration.js <filename>
 * Example: node src/db/runMigration.js 001_dashboard.sql
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { pool } = require('./db');

const file = process.argv[2];
if (!file) { console.error('Usage: node runMigration.js <filename>'); process.exit(1); }

const sqlPath = path.join(__dirname, 'migrations', file);
if (!fs.existsSync(sqlPath)) { console.error(`File not found: ${sqlPath}`); process.exit(1); }

async function run() {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log(`✅  Migration applied: ${file}`);
  } catch (err) {
    console.error('❌  Migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
run();
