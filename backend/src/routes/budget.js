const router = require('express').Router({ mergeParams: true });
const db     = require('../db/db');
const { authenticate } = require('../middleware/auth');

async function getTrip(id, userId) {
  const { rows } = await db.query(
    'SELECT * FROM trips WHERE id=$1 AND deleted_at IS NULL', [id]
  );
  if (!rows.length) return [null, 'Trip not found'];
  if (rows[0].owner_id !== userId) return [null, 'Not your trip', 403];
  return [rows[0], null];
}

async function getOrCreateBudget(tripId) {
  let { rows } = await db.query('SELECT * FROM budgets WHERE trip_id=$1', [tripId]);
  if (!rows.length) {
    const ins = await db.query(
      'INSERT INTO budgets (trip_id, total_budget) VALUES ($1,0) RETURNING *', [tripId]
    );
    rows = ins.rows;
  }
  return rows[0];
}

// GET /api/trips/:tripId/budget
router.get('/', authenticate, async (req, res) => {
  const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
  if (err) return res.status(status || 404).json({ error: err });
  res.json(await getOrCreateBudget(trip.id));
});

// PUT /api/trips/:tripId/budget
router.put('/', authenticate, async (req, res) => {
  const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
  if (err) return res.status(status || 404).json({ error: err });

  const { total_budget, currency } = req.body;
  const budget = await getOrCreateBudget(trip.id);

  const { rows } = await db.query(
    `UPDATE budgets
     SET total_budget = COALESCE($1, total_budget),
         currency     = COALESCE($2, currency)
     WHERE id=$3 RETURNING *`,
    [total_budget || null, currency || null, budget.id]
  );
  res.json(rows[0]);
});

// GET /api/trips/:tripId/budget/summary
router.get('/summary', authenticate, async (req, res) => {
  const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
  if (err) return res.status(status || 404).json({ error: err });

  const budget = await getOrCreateBudget(trip.id);

  const catRows = (await db.query(
    `SELECT category, SUM(amount) AS total
     FROM expenses WHERE trip_id=$1
     GROUP BY category`,
    [trip.id]
  )).rows;

  const totalSpent = catRows.reduce((s, r) => s + parseFloat(r.total), 0);
  const totalBudget = parseFloat(budget.total_budget);

  const categories = catRows.map(r => ({
    category:   r.category,
    amount:     parseFloat(r.total),
    percentage: totalSpent > 0 ? Math.round(parseFloat(r.total) / totalSpent * 100 * 10) / 10 : 0,
  }));

  res.json({
    total_budget: totalBudget,
    total_spent:  Math.round(totalSpent * 100) / 100,
    remaining:    Math.round((totalBudget - totalSpent) * 100) / 100,
    currency:     budget.currency,
    categories,
  });
});

module.exports = router;
