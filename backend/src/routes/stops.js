const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');
const db       = require('../db/db');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── helpers ───────────────────────────────────────────────────
async function getTrip(tripId) {
  const { rows } = await db.query(
    'SELECT * FROM trips WHERE id = $1 AND deleted_at IS NULL', [tripId]
  );
  return rows[0] || null;
}
function assertOwner(trip, userId) {
  if (trip.owner_id !== userId) throw { status: 403, message: 'Not your trip' };
}
async function getStop(stopId, tripId) {
  const { rows } = await db.query(
    'SELECT * FROM trip_stops WHERE id = $1 AND trip_id = $2', [stopId, tripId]
  );
  return rows[0] || null;
}

// GET  /api/trips/:tripId/stops
router.get('/', authenticate, async (req, res) => {
  const trip = await getTrip(req.params.tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  try { assertOwner(trip, req.user.id); } catch (e) { return res.status(e.status).json({ error: e.message }); }

  const { rows } = await db.query(
    `SELECT s.*, COALESCE(json_agg(a ORDER BY a.sort_order) FILTER (WHERE a.id IS NOT NULL), '[]') AS activities
     FROM trip_stops s
     LEFT JOIN activities a ON a.stop_id = s.id
     WHERE s.trip_id = $1
     GROUP BY s.id
     ORDER BY s.sort_order`,
    [trip.id]
  );
  res.json(rows);
});

// POST /api/trips/:tripId/stops
router.post('/', authenticate,
  [body('city_name').trim().notEmpty()],
  validate,
  async (req, res) => {
    const trip = await getTrip(req.params.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    try { assertOwner(trip, req.user.id); } catch (e) { return res.status(e.status).json({ error: e.message }); }

    const { city_name, country, latitude, longitude, arrival_date,
            departure_date, duration_nights = 1, accommodation, notes } = req.body;

    const countRes = await db.query('SELECT COUNT(*) FROM trip_stops WHERE trip_id = $1', [trip.id]);
    const sort_order = parseInt(countRes.rows[0].count);

    const { rows } = await db.query(
      `INSERT INTO trip_stops
         (trip_id, city_name, country, latitude, longitude, arrival_date, departure_date,
          duration_nights, accommodation, notes, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [trip.id, city_name, country || null, latitude || null, longitude || null,
       arrival_date || null, departure_date || null, duration_nights,
       accommodation || null, notes || null, sort_order]
    );
    res.status(201).json(rows[0]);
  }
);

// PUT /api/trips/:tripId/stops/:stopId
router.put('/:stopId', authenticate, async (req, res) => {
  const trip = await getTrip(req.params.tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  try { assertOwner(trip, req.user.id); } catch (e) { return res.status(e.status).json({ error: e.message }); }

  const stop = await getStop(req.params.stopId, trip.id);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });

  const { city_name, country, latitude, longitude, arrival_date,
          departure_date, duration_nights, accommodation, notes, sort_order } = req.body;

  const { rows } = await db.query(
    `UPDATE trip_stops SET
       city_name       = COALESCE($1, city_name),
       country         = COALESCE($2, country),
       latitude        = COALESCE($3, latitude),
       longitude       = COALESCE($4, longitude),
       arrival_date    = COALESCE($5, arrival_date),
       departure_date  = COALESCE($6, departure_date),
       duration_nights = COALESCE($7, duration_nights),
       accommodation   = COALESCE($8, accommodation),
       notes           = COALESCE($9, notes),
       sort_order      = COALESCE($10, sort_order)
     WHERE id = $11 RETURNING *`,
    [city_name||null, country||null, latitude||null, longitude||null,
     arrival_date||null, departure_date||null, duration_nights||null,
     accommodation||null, notes||null, sort_order||null, stop.id]
  );
  res.json(rows[0]);
});

// DELETE /api/trips/:tripId/stops/:stopId
router.delete('/:stopId', authenticate, async (req, res) => {
  const trip = await getTrip(req.params.tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  try { assertOwner(trip, req.user.id); } catch (e) { return res.status(e.status).json({ error: e.message }); }

  const stop = await getStop(req.params.stopId, trip.id);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });

  await db.query('DELETE FROM trip_stops WHERE id = $1', [stop.id]);
  res.status(204).send();
});

// PATCH /api/trips/:tripId/stops/reorder
router.patch('/reorder', authenticate, async (req, res) => {
  const { ids } = req.body; // ordered array of stop IDs
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });

  const trip = await getTrip(req.params.tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  try { assertOwner(trip, req.user.id); } catch (e) { return res.status(e.status).json({ error: e.message }); }

  for (let i = 0; i < ids.length; i++) {
    await db.query(
      'UPDATE trip_stops SET sort_order = $1 WHERE id = $2 AND trip_id = $3',
      [i, ids[i], trip.id]
    );
  }
  res.json({ message: 'Stops reordered' });
});

module.exports = router;
