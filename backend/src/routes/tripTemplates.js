const router = require('express').Router();
const db     = require('../db/db');
const { authenticate } = require('../middleware/auth');

// GET /api/trip-templates
router.get('/', authenticate, async (req, res) => {
  const { category } = req.query;
  const params = [];
  let where = '';
  if (category) {
    params.push(`%${category}%`);
    where = `WHERE category ILIKE $1`;
  }
  const { rows } = await db.query(
    `SELECT * FROM trip_templates ${where} ORDER BY title`, params
  );
  res.json(rows);
});

// GET /api/trip-templates/:id
router.get('/:id', authenticate, async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM trip_templates WHERE id=$1', [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Template not found' });
  res.json(rows[0]);
});

module.exports = router;
