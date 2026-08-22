const router = require('express').Router();
const { body, query: qv } = require('express-validator');
const db       = require('../db/db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── helper: auto-derive trip status from dates ────────────────────────────────
function deriveStatus(startDate, endDate) {
  if (!startDate) return 'draft';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const s = new Date(startDate);
  const e = endDate ? new Date(endDate) : null;
  if (e && today > e) return 'completed';
  if (today >= s)     return 'ongoing';
  return 'upcoming';
}

function assertOwner(trip, userId) {
  if (trip.owner_id !== userId) throw { status: 403, message: 'Not your trip' };
}

// ── GET /api/trips ────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  const { status, q, sort_by = 'created_at', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [req.user.id];
  let where = 'WHERE t.owner_id = $1 AND t.deleted_at IS NULL';

  if (status) { params.push(status); where += ` AND t.status = $${params.length}`; }
  if (q)      { params.push(`%${q}%`); where += ` AND (t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`; }

  const sortMap = { created_at: 't.created_at DESC', start_date: 't.start_date DESC', title: 't.title ASC' };
  const orderBy = sortMap[sort_by] || 't.created_at DESC';

  params.push(parseInt(limit), offset);
  const { rows } = await db.query(
    `SELECT t.*, u.first_name, u.last_name, u.avatar_url AS owner_avatar
     FROM trips t JOIN users u ON u.id = t.owner_id
     ${where} ORDER BY ${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  const total = (await db.query(`SELECT COUNT(*) FROM trips t ${where}`, params.slice(0, params.length - 2))).rows[0].count;
  res.json({ items: rows, total: parseInt(total), page: parseInt(page), limit: parseInt(limit), has_more: offset + rows.length < parseInt(total) });
});

// ── POST /api/trips ───────────────────────────────────────────────────────────
router.post('/', authenticate,
  [body('title').trim().notEmpty()],
  validate,
  async (req, res) => {
    const { title, description, cover_image_url, start_date, end_date, visibility = 'private' } = req.body;
    const status = deriveStatus(start_date, end_date);

    const { rows } = await db.query(
      `INSERT INTO trips (owner_id, title, description, cover_image_url, start_date, end_date, status, visibility)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, title, description || null, cover_image_url || null, start_date || null, end_date || null, status, visibility]
    );
    const trip = rows[0];
    // Auto-create zero budget
    await db.query('INSERT INTO budgets (trip_id, total_budget) VALUES ($1, 0)', [trip.id]);
    res.status(201).json(trip);
  }
);

// ── GET /api/trips/calendar  ← MUST be before /:id to avoid "calendar" being parsed as an id
router.get('/calendar', authenticate, async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'month and year required' });

  const start = `${year}-${String(month).padStart(2,'0')}-01`;
  const end   = new Date(year, month, 0).toISOString().slice(0,10);

  const { rows } = await db.query(
    `SELECT id, title, start_date, end_date, status
     FROM trips
     WHERE owner_id = $1 AND deleted_at IS NULL
       AND start_date <= $2 AND end_date >= $3`,
    [req.user.id, end, start]
  );
  const STATUS_COLOR = { draft:'gray', upcoming:'blue', ongoing:'green', completed:'purple' };
  res.json({
    month: parseInt(month), year: parseInt(year),
    events: rows.map(t => ({ ...t, trip_id: t.id, color_key: STATUS_COLOR[t.status] || 'gray' }))
  });
});

// ── POST /api/trips/from-template/:templateId  ← MUST be before /:id
router.post('/from-template/:templateId', authenticate,
  [body('title').trim().notEmpty()],
  validate,
  async (req, res) => {
    const { rows: [tmpl] } = await db.query(
      'SELECT * FROM trip_templates WHERE id = $1', [req.params.templateId]
    );
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });

    const { title, start_date, end_date } = req.body;
    const status = deriveStatus(start_date, end_date);

    const { rows: [trip] } = await db.query(
      `INSERT INTO trips (owner_id, title, description, cover_image_url, start_date, end_date, status, visibility)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'private') RETURNING *`,
      [req.user.id, title, tmpl.description, tmpl.cover_image_url, start_date || null, end_date || null, status]
    );
    await db.query(
      'INSERT INTO budgets (trip_id, total_budget, currency) VALUES ($1,$2,$3)',
      [trip.id, tmpl.estimated_budget || 0, tmpl.currency || 'USD']
    );
    res.status(201).json(trip);
  }
);

// ── GET /api/trips/:id ────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  const { rows } = await db.query(
    `SELECT t.*, u.first_name, u.last_name, u.avatar_url AS owner_avatar
     FROM trips t JOIN users u ON u.id = t.owner_id
     WHERE t.id = $1 AND t.deleted_at IS NULL`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Trip not found' });
  const trip = rows[0];
  if (trip.owner_id !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({ error: 'Not your trip' });
  }

  const stops = await db.query(
    'SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY sort_order',
    [trip.id]
  );
  for (const stop of stops.rows) {
    const acts = await db.query(
      'SELECT * FROM activities WHERE stop_id = $1 ORDER BY sort_order',
      [stop.id]
    );
    stop.activities = acts.rows;
  }
  trip.stops  = stops.rows;
  trip.budget = (await db.query('SELECT * FROM budgets WHERE trip_id = $1', [trip.id])).rows[0] || null;

  res.json(trip);
});

// ── PUT /api/trips/:id ────────────────────────────────────────────────────────
router.put('/:id', authenticate,
  [body('title').optional().trim().notEmpty()],
  validate,
  async (req, res) => {
    const { rows: [trip] } = await db.query(
      'SELECT * FROM trips WHERE id = $1 AND deleted_at IS NULL', [req.params.id]
    );
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    try { assertOwner(trip, req.user.id); } catch (e) { return res.status(e.status).json({ error: e.message }); }

    const { title, description, cover_image_url, start_date, end_date, status, visibility } = req.body;
    const newStatus = status || deriveStatus(start_date ?? trip.start_date, end_date ?? trip.end_date);

    const { rows } = await db.query(
      `UPDATE trips
       SET title           = COALESCE($1, title),
           description     = COALESCE($2, description),
           cover_image_url = COALESCE($3, cover_image_url),
           start_date      = COALESCE($4, start_date),
           end_date        = COALESCE($5, end_date),
           status          = $6,
           visibility      = COALESCE($7, visibility)
       WHERE id = $8 RETURNING *`,
      [title||null, description||null, cover_image_url||null, start_date||null, end_date||null, newStatus, visibility||null, trip.id]
    );
    res.json(rows[0]);
  }
);

// ── DELETE /api/trips/:id (soft delete) ───────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  const { rows: [trip] } = await db.query(
    'SELECT * FROM trips WHERE id = $1 AND deleted_at IS NULL', [req.params.id]
  );
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  try { assertOwner(trip, req.user.id); } catch (e) { return res.status(e.status).json({ error: e.message }); }

  await db.query('UPDATE trips SET deleted_at = NOW() WHERE id = $1', [trip.id]);
  res.status(204).send();
});

// ── GET /api/trips/:id/public (no auth required) ──────────────────────────────
router.get('/:id/public', optionalAuth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT t.*, u.first_name, u.last_name, u.avatar_url AS owner_avatar
     FROM trips t JOIN users u ON u.id = t.owner_id
     WHERE t.id = $1 AND t.deleted_at IS NULL AND t.visibility = 'public'`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Trip not found or not public' });
  const trip = rows[0];

  const stops = await db.query(
    'SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY sort_order', [trip.id]
  );
  for (const s of stops.rows) {
    s.activities = (await db.query('SELECT * FROM activities WHERE stop_id = $1 ORDER BY sort_order', [s.id])).rows;
  }
  trip.stops = stops.rows;
  res.json(trip);
});

// ── POST /api/trips/:id/view (fire-and-forget view counter) ──────────────────
router.post('/:id/view', async (req, res) => {
  db.query('UPDATE trips SET view_count = view_count + 1 WHERE id = $1 AND deleted_at IS NULL', [req.params.id])
    .catch(() => {});
  res.status(204).send();
});

// ── POST /api/trips/:id/copy ──────────────────────────────────────────────────
router.post('/:id/copy', authenticate, async (req, res) => {
  const { rows: [src] } = await db.query(
    `SELECT t.* FROM trips t WHERE t.id = $1 AND t.deleted_at IS NULL
     AND (t.visibility = 'public' OR t.owner_id = $2)`,
    [req.params.id, req.user.id]
  );
  if (!src) return res.status(404).json({ error: 'Trip not found or not public' });

  const { rows: [newTrip] } = await db.query(
    `INSERT INTO trips (owner_id, title, description, cover_image_url, start_date, end_date, status, visibility)
     VALUES ($1,$2,$3,$4,$5,$6,'draft','private') RETURNING *`,
    [req.user.id, `Copy of ${src.title}`, src.description, src.cover_image_url, src.start_date, src.end_date]
  );

  // Copy budget
  const srcBudget = (await db.query('SELECT * FROM budgets WHERE trip_id = $1', [src.id])).rows[0];
  await db.query(
    'INSERT INTO budgets (trip_id, total_budget, currency) VALUES ($1,$2,$3)',
    [newTrip.id, srcBudget?.total_budget || 0, srcBudget?.currency || 'USD']
  );

  // Copy stops + activities
  const stops = (await db.query('SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY sort_order', [src.id])).rows;
  for (const stop of stops) {
    const { rows: [newStop] } = await db.query(
      `INSERT INTO trip_stops (trip_id, city_name, country, latitude, longitude,
        arrival_date, departure_date, duration_nights, accommodation, notes, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [newTrip.id, stop.city_name, stop.country, stop.latitude, stop.longitude,
       stop.arrival_date, stop.departure_date, stop.duration_nights, stop.accommodation, stop.notes, stop.sort_order]
    );
    const acts = (await db.query('SELECT * FROM activities WHERE stop_id = $1 ORDER BY sort_order', [stop.id])).rows;
    for (const a of acts) {
      await db.query(
        `INSERT INTO activities (stop_id, name, description, start_time, end_time, cost, currency, category, added_by_user_id, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [newStop.id, a.name, a.description, a.start_time, a.end_time, a.cost, a.currency, a.category, req.user.id, a.sort_order]
      );
    }
  }
  res.status(201).json({ new_trip_id: newTrip.id, message: 'Trip copied successfully' });
});

// ── POST /api/trips/:id/save-to-my-trips ─────────────────────────────────────
router.post('/:id/save-to-my-trips', authenticate, async (req, res) => {
  const { rows: [trip] } = await db.query(
    `SELECT * FROM trips WHERE id = $1 AND deleted_at IS NULL AND (visibility = 'public' OR owner_id = $2)`,
    [req.params.id, req.user.id]
  );
  if (!trip) return res.status(404).json({ error: 'Trip not found or not public' });

  await db.query(
    'INSERT INTO trip_shares (trip_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [trip.id, req.user.id]
  );
  res.json({ message: 'Saved to your trips', trip_id: trip.id });
});

module.exports = router;
