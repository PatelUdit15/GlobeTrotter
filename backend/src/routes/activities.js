const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');
const db       = require('../db/db');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

async function getTrip(id) {
  return (await db.query('SELECT * FROM trips WHERE id=$1 AND deleted_at IS NULL', [id])).rows[0] || null;
}
async function getStop(stopId, tripId) {
  return (await db.query('SELECT * FROM trip_stops WHERE id=$1 AND trip_id=$2', [stopId, tripId])).rows[0] || null;
}
async function getActivity(actId, stopId) {
  return (await db.query('SELECT * FROM activities WHERE id=$1 AND stop_id=$2', [actId, stopId])).rows[0] || null;
}

// GET  /api/trips/:tripId/stops/:stopId/activities
router.get('/', authenticate, async (req, res) => {
  const { tripId, stopId } = req.params;
  const trip = await getTrip(tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your trip' });
  const stop = await getStop(stopId, tripId);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });

  const { rows } = await db.query(
    `SELECT a.*, u.first_name AS added_by_first, u.last_name AS added_by_last, u.avatar_url AS added_by_avatar
     FROM activities a
     LEFT JOIN users u ON u.id = a.added_by_user_id
     WHERE a.stop_id = $1 ORDER BY a.sort_order`,
    [stop.id]
  );
  res.json(rows);
});

// POST /api/trips/:tripId/stops/:stopId/activities
router.post('/', authenticate,
  [body('name').trim().notEmpty()],
  validate,
  async (req, res) => {
    const { tripId, stopId } = req.params;
    const trip = await getTrip(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your trip' });
    const stop = await getStop(stopId, tripId);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });

    const { name, description, start_time, end_time, cost = 0,
            currency = 'USD', category = 'activity' } = req.body;

    const countRes = await db.query('SELECT COUNT(*) FROM activities WHERE stop_id=$1', [stop.id]);
    const sort_order = parseInt(countRes.rows[0].count);

    const { rows } = await db.query(
      `INSERT INTO activities
         (stop_id, name, description, start_time, end_time, cost, currency, category, added_by_user_id, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [stop.id, name, description||null, start_time||null, end_time||null,
       cost, currency, category, req.user.id, sort_order]
    );
    res.status(201).json(rows[0]);
  }
);

// PUT /api/trips/:tripId/stops/:stopId/activities/:actId
router.put('/:actId', authenticate, async (req, res) => {
  const { tripId, stopId, actId } = req.params;
  const trip = await getTrip(tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your trip' });
  const stop = await getStop(stopId, tripId);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });
  const act  = await getActivity(actId, stop.id);
  if (!act)  return res.status(404).json({ error: 'Activity not found' });

  const { name, description, start_time, end_time, cost, currency, category, sort_order } = req.body;

  const { rows } = await db.query(
    `UPDATE activities SET
       name        = COALESCE($1, name),
       description = COALESCE($2, description),
       start_time  = COALESCE($3, start_time),
       end_time    = COALESCE($4, end_time),
       cost        = COALESCE($5, cost),
       currency    = COALESCE($6, currency),
       category    = COALESCE($7, category),
       sort_order  = COALESCE($8, sort_order)
     WHERE id = $9 RETURNING *`,
    [name||null, description||null, start_time||null, end_time||null,
     cost||null, currency||null, category||null, sort_order||null, act.id]
  );
  res.json(rows[0]);
});

// DELETE /api/trips/:tripId/stops/:stopId/activities/:actId
router.delete('/:actId', authenticate, async (req, res) => {
  const { tripId, stopId, actId } = req.params;
  const trip = await getTrip(tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your trip' });
  const stop = await getStop(stopId, tripId);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });
  const act  = await getActivity(actId, stop.id);
  if (!act)  return res.status(404).json({ error: 'Activity not found' });

  await db.query('DELETE FROM activities WHERE id = $1', [act.id]);
  res.status(204).send();
});

// PATCH /api/trips/:tripId/stops/:stopId/activities/reorder
router.patch('/reorder', authenticate, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });

  const { tripId, stopId } = req.params;
  const trip = await getTrip(tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your trip' });

  for (let i = 0; i < ids.length; i++) {
    await db.query(
      'UPDATE activities SET sort_order=$1 WHERE id=$2 AND stop_id=$3',
      [i, ids[i], stopId]
    );
  }
  res.json({ message: 'Activities reordered' });
});

module.exports = router;
