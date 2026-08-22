const router = require('express').Router();
const db     = require('../db/db');
const { authenticate } = require('../middleware/auth');

// Hardcoded activity suggestions per city (extend or move to DB as needed)
const SUGGESTIONS = {
  paris:   [
    { name: 'Eiffel Tower visit',     category: 'sightseeing', estimated_cost: 28,  description: 'Visit the iconic iron lattice tower.' },
    { name: 'Louvre Museum',           category: 'sightseeing', estimated_cost: 17,  description: "World's largest art museum." },
    { name: 'Seine River Cruise',      category: 'activity',    estimated_cost: 15,  description: '1-hour scenic boat tour.' },
    { name: 'Café de Flore breakfast', category: 'dining',      estimated_cost: 25,  description: 'Classic Parisian café.' },
  ],
  tokyo:   [
    { name: 'Shibuya Crossing',        category: 'sightseeing', estimated_cost: 0,   description: "World's busiest crossing." },
    { name: 'Tsukiji Outer Market',    category: 'dining',      estimated_cost: 20,  description: 'Fresh sushi & street food.' },
    { name: 'TeamLab Planets',         category: 'activity',    estimated_cost: 32,  description: 'Immersive digital art.' },
    { name: 'Meiji Shrine',            category: 'sightseeing', estimated_cost: 0,   description: 'Serene Shinto shrine.' },
  ],
  default: [
    { name: 'City walking tour',       category: 'sightseeing', estimated_cost: 0,   description: 'Explore the city on foot.' },
    { name: 'Local restaurant',        category: 'dining',      estimated_cost: 20,  description: 'Try authentic local cuisine.' },
    { name: 'Museum visit',            category: 'sightseeing', estimated_cost: 15,  description: 'Visit the main city museum.' },
  ],
};

// GET /api/cities
router.get('/', authenticate, async (req, res) => {
  const { q, region, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const conditions = [];

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(name ILIKE $${params.length} OR country ILIKE $${params.length})`);
  }
  if (region) {
    params.push(`%${region}%`);
    conditions.push(`region ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(parseInt(limit), offset);

  const { rows } = await db.query(
    `SELECT * FROM cities ${where} ORDER BY name LIMIT $${params.length-1} OFFSET $${params.length}`,
    params
  );
  const total = parseInt((await db.query(`SELECT COUNT(*) FROM cities ${where}`, params.slice(0,-2))).rows[0].count);
  res.json({ items: rows, total, page: parseInt(page), limit: parseInt(limit), has_more: offset + rows.length < total });
});

// GET /api/cities/featured  (no auth required — used on dashboard)
router.get('/featured', async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const { rows } = await db.query(
    'SELECT * FROM cities WHERE is_featured = TRUE ORDER BY RANDOM() LIMIT $1', [limit]
  );
  res.json(rows);
});

// GET /api/cities/recommended
router.get('/recommended', authenticate, async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const { rows } = await db.query(
    'SELECT * FROM cities ORDER BY cost_level ASC, name ASC LIMIT $1', [limit]
  );
  res.json(rows);
});

// GET /api/cities/:cityName/suggestions
router.get('/:cityName/suggestions', authenticate, (req, res) => {
  const key = req.params.cityName.trim().toLowerCase();
  const list = SUGGESTIONS[key] || SUGGESTIONS.default;
  res.json(list.map(s => ({ ...s, currency: 'USD' })));
});

module.exports = router;
