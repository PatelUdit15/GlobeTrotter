const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'globetrotter',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'odooldce',
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ PostgreSQL connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

/**
 * Execute a parameterised query.
 * @param {string} text   SQL string with $1, $2 … placeholders
 * @param {Array}  params Parameter values
 */
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
