const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');
const db       = require('../db/db');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

async function getTrip(id, userId) {
  const { rows } = await db.query(
    'SELECT * FROM trips WHERE id=$1 AND deleted_at IS NULL', [id]
  );
  if (!rows.length) return [null, 'Trip not found'];
  if (rows[0].owner_id !== userId) return [null, 'Not your trip', 403];
  return [rows[0], null];
}

// GET /api/trips/:tripId/expenses
router.get('/', authenticate, async (req, res) => {
  const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
  if (err) return res.status(status || 404).json({ error: err });

  const { category, status: expStatus, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [trip.id];
  let where = 'WHERE trip_id=$1';

  if (category)  { params.push(category);  where += ` AND category=$${params.length}`; }
  if (expStatus) { params.push(expStatus); where += ` AND status=$${params.length}`; }

  params.push(parseInt(limit), offset);
  const { rows } = await db.query(
    `SELECT * FROM expenses ${where} ORDER BY date DESC NULLS LAST
     LIMIT $${params.length-1} OFFSET $${params.length}`,
    params
  );
  const total = parseInt((await db.query(`SELECT COUNT(*) FROM expenses ${where}`, params.slice(0,-2))).rows[0].count);
  res.json({ items: rows, total, page: parseInt(page), limit: parseInt(limit), has_more: offset + rows.length < total });
});

// POST /api/trips/:tripId/expenses
router.post('/', authenticate,
  [body('description').trim().notEmpty(), body('amount').isFloat({ gt: 0 })],
  validate,
  async (req, res) => {
    const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
    if (err) return res.status(status || 404).json({ error: err });

    const { description, category = 'other', amount, currency = 'USD', date, status: expStatus = 'pending' } = req.body;
    const { rows } = await db.query(
      `INSERT INTO expenses (trip_id, description, category, amount, currency, date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [trip.id, description, category, amount, currency, date || null, expStatus]
    );
    res.status(201).json(rows[0]);
  }
);

// PUT /api/trips/:tripId/expenses/:expId
router.put('/:expId', authenticate, async (req, res) => {
  const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
  if (err) return res.status(status || 404).json({ error: err });

  const { rows: [exp] } = await db.query(
    'SELECT * FROM expenses WHERE id=$1 AND trip_id=$2', [req.params.expId, trip.id]
  );
  if (!exp) return res.status(404).json({ error: 'Expense not found' });

  const { description, category, amount, currency, date, status: expStatus } = req.body;
  const { rows } = await db.query(
    `UPDATE expenses SET
       description = COALESCE($1, description),
       category    = COALESCE($2, category),
       amount      = COALESCE($3, amount),
       currency    = COALESCE($4, currency),
       date        = COALESCE($5, date),
       status      = COALESCE($6, status)
     WHERE id=$7 RETURNING *`,
    [description||null, category||null, amount||null, currency||null, date||null, expStatus||null, exp.id]
  );
  res.json(rows[0]);
});

// DELETE /api/trips/:tripId/expenses/:expId
router.delete('/:expId', authenticate, async (req, res) => {
  const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
  if (err) return res.status(status || 404).json({ error: err });

  const { rows: [exp] } = await db.query(
    'SELECT * FROM expenses WHERE id=$1 AND trip_id=$2', [req.params.expId, trip.id]
  );
  if (!exp) return res.status(404).json({ error: 'Expense not found' });
  await db.query('DELETE FROM expenses WHERE id=$1', [exp.id]);
  res.status(204).send();
});

// GET /api/trips/:tripId/expenses/export  (CSV download)
router.get('/export', authenticate, async (req, res) => {
  const [trip, err, status] = await getTrip(req.params.tripId, req.user.id);
  if (err) return res.status(status || 404).json({ error: err });

  const { rows } = await db.query(
    'SELECT * FROM expenses WHERE trip_id=$1 ORDER BY date DESC NULLS LAST', [trip.id]
  );

  const header = 'id,date,description,category,amount,currency,status\n';
  const csv = rows.map(e =>
    `${e.id},${e.date||''},${JSON.stringify(e.description)},${e.category},${e.amount},${e.currency},${e.status}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="trip_${trip.id}_expenses.csv"`);
  res.send(header + csv);
});

module.exports = router;
