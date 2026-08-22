const router = require('express').Router();
const db     = require('../db/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const totalUsers   = parseInt((await db.query('SELECT COUNT(*) FROM users')).rows[0].count);
  const activeTrips  = parseInt((await db.query("SELECT COUNT(*) FROM trips WHERE status='ongoing' AND deleted_at IS NULL")).rows[0].count);
  const premiumUsers = parseInt((await db.query("SELECT COUNT(*) FROM users WHERE membership_tier='premium'")).rows[0].count);
  const revenue      = Math.round(premiumUsers * 9.99 * 100) / 100;

  // 30-day growth
  const now       = new Date();
  const month1    = new Date(now - 30 * 86400000).toISOString();
  const month2    = new Date(now - 60 * 86400000).toISOString();
  const thisMonth = parseInt((await db.query('SELECT COUNT(*) FROM users WHERE created_at >= $1', [month1])).rows[0].count);
  const prevMonth = parseInt((await db.query('SELECT COUNT(*) FROM users WHERE created_at >= $1 AND created_at < $2', [month2, month1])).rows[0].count);
  const pct = prevMonth === 0 ? (thisMonth ? 100 : 0) : Math.round((thisMonth - prevMonth) / prevMonth * 1000) / 10;

  res.json({
    total_users: totalUsers,
    active_trips: activeTrips,
    revenue,
    support_tickets: 0,
    changes: {
      total_users:     { value: Math.abs(pct), direction: pct >= 0 ? 'up' : 'down', label: `${pct >= 0 ? '+' : ''}${pct}% from last month` },
      active_trips:    { value: 0, direction: 'up', label: 'N/A' },
      revenue:         { value: 0, direction: 'up', label: 'N/A' },
      support_tickets: { value: 0, direction: 'up', label: 'N/A' },
    },
  });
});

// GET /api/admin/stats/user-growth?year=2025
router.get('/stats/user-growth', async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const { rows } = await db.query(
    `SELECT EXTRACT(MONTH FROM created_at)::int AS month, COUNT(*)::int AS count
     FROM users
     WHERE EXTRACT(YEAR FROM created_at) = $1
     GROUP BY month`,
    [year]
  );
  const map = {};
  rows.forEach(r => { map[r.month] = r.count; });
  const LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data   = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1, month_label: LABELS[i], count: map[i + 1] || 0,
  }));
  res.json({ year, data });
});

// GET /api/admin/destinations/top
router.get('/destinations/top', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const { rows } = await db.query(
    `SELECT city_name AS name, COUNT(*)::int AS trips_count
     FROM trip_stops GROUP BY city_name ORDER BY trips_count DESC LIMIT $1`,
    [limit]
  );
  const total = rows.reduce((s, r) => s + r.trips_count, 0);
  res.json(rows.map(r => ({
    name: r.name,
    trips_count: r.trips_count,
    percentage: total > 0 ? Math.round(r.trips_count / total * 1000) / 10 : 0,
  })));
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  let where = '';

  if (q) {
    params.push(`%${q}%`);
    where = `WHERE (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)`;
  }

  params.push(parseInt(limit), offset);
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.city, u.country,
            u.avatar_url, u.membership_tier, u.is_active, u.is_admin, u.created_at,
            (SELECT COUNT(*) FROM trips t WHERE t.owner_id=u.id AND t.deleted_at IS NULL)::int AS trips_count
     FROM users u ${where}
     ORDER BY u.created_at DESC
     LIMIT $${params.length-1} OFFSET $${params.length}`,
    params
  );
  const total = parseInt((await db.query(`SELECT COUNT(*) FROM users u ${where}`, params.slice(0,-2))).rows[0].count);
  res.json({ items: rows, total, page: parseInt(page), limit: parseInt(limit), has_more: offset + rows.length < total });
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  const { rows: [user] } = await db.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { first_name, last_name, email, is_active, is_admin, membership_tier } = req.body;
  const { rows } = await db.query(
    `UPDATE users SET
       first_name      = COALESCE($1, first_name),
       last_name       = COALESCE($2, last_name),
       email           = COALESCE($3, email),
       is_active       = COALESCE($4, is_active),
       is_admin        = COALESCE($5, is_admin),
       membership_tier = COALESCE($6, membership_tier)
     WHERE id=$7
     RETURNING id, email, first_name, last_name, is_active, is_admin, membership_tier, created_at`,
    [first_name||null, last_name||null, email||null,
     is_active??null, is_admin??null, membership_tier||null, user.id]
  );
  res.json(rows[0]);
});

// DELETE /api/admin/users/:id  (deactivate)
router.delete('/users/:id', async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot deactivate your own admin account' });
  }
  const { rows: [user] } = await db.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await db.query('UPDATE users SET is_active=FALSE WHERE id=$1', [user.id]);
  res.status(204).send();
});

// GET /api/admin/reports/export  (CSV)
router.get('/reports/export', async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, first_name, last_name, email, phone, city, country,
            membership_tier, is_active, is_admin, created_at
     FROM users ORDER BY created_at DESC`
  );

  const header = 'id,first_name,last_name,email,phone,city,country,membership_tier,is_active,is_admin,created_at\n';
  const csv = rows.map(u =>
    [u.id, u.first_name, u.last_name, u.email, u.phone||'', u.city||'', u.country||'',
     u.membership_tier, u.is_active, u.is_admin, u.created_at].join(',')
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users_report.csv"');
  res.send(header + csv);
});

module.exports = router;
