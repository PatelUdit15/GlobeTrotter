/**
 * Dashboard routes
 *
 * GET /api/dashboard/landing
 *   → { userProfile, destinations, userTrips, stats }
 *
 * GET /api/dashboard/destinations
 *   ?search=&region=&sortBy=popularity|name|cost_level&groupBy=region|none&filter=featured|all
 *   → { items: Destination[], total: number }
 */

const router = require('express').Router();
const db     = require('../db/db');
const { authenticate } = require('../middleware/auth');

// ── helpers ───────────────────────────────────────────────────────────────────

/** Derive human-readable status badge colour key */
const STATUS_BADGE = {
  draft:     { label: 'Draft',     color: 'gray' },
  upcoming:  { label: 'Upcoming',  color: 'blue' },
  ongoing:   { label: 'In Progress', color: 'green' },
  completed: { label: 'Completed', color: 'purple' },
};

/** Format a Date range string like "Oct 12 - Oct 18, 2024" */
function formatDateRange(start, end) {
  if (!start) return null;
  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const yearStr = end
    ? `, ${new Date(end).getFullYear()}`
    : `, ${new Date(start).getFullYear()}`;
  return end
    ? `${fmt(start)} - ${fmt(end)}${yearStr}`
    : `${fmt(start)}${yearStr}`;
}

// ── GET /api/dashboard/landing ────────────────────────────────────────────────
router.get('/landing', authenticate, async (req, res) => {
  const userId = req.user.id;

  // 1. User profile
  const { rows: [userRow] } = await db.query(
    `SELECT id, first_name, last_name, email, avatar_url, city, country, membership_tier
     FROM users WHERE id = $1`,
    [userId]
  );

  // 2. Top destinations (featured first, then by popularity_score desc, limit 8)
  const { rows: destinations } = await db.query(
    `SELECT id, name, region, country, image_url, popularity_score, is_featured,
            cost_level, popularity_label
     FROM destinations
     ORDER BY is_featured DESC, popularity_score DESC
     LIMIT 8`
  );

  // 3. User's recent trips (last 4, with budget info)
  const { rows: tripRows } = await db.query(
    `SELECT
       t.id, t.title, t.description, t.cover_image_url,
       t.start_date, t.end_date, t.status, t.created_at,
       b.total_budget, b.currency,
       COALESCE(SUM(e.amount), 0)                          AS total_spent,
       COUNT(DISTINCT ts.id)                               AS stop_count
     FROM trips t
     LEFT JOIN budgets  b  ON b.trip_id  = t.id
     LEFT JOIN expenses e  ON e.trip_id  = t.id
     LEFT JOIN trip_stops ts ON ts.trip_id = t.id
     WHERE t.owner_id = $1 AND t.deleted_at IS NULL
     GROUP BY t.id, b.total_budget, b.currency
     ORDER BY t.created_at DESC
     LIMIT 4`,
    [userId]
  );

  const userTrips = tripRows.map((t) => ({
    id:              t.id,
    title:           t.title,
    description:     t.description,
    cover_image_url: t.cover_image_url,
    dates:           formatDateRange(t.start_date, t.end_date),
    start_date:      t.start_date,
    end_date:        t.end_date,
    status:          t.status,
    status_badge:    STATUS_BADGE[t.status] || STATUS_BADGE.draft,
    stop_count:      parseInt(t.stop_count),
    total_budget:    parseFloat(t.total_budget) || 0,
    total_spent:     parseFloat(t.total_spent)  || 0,
    remaining:       (parseFloat(t.total_budget) || 0) - (parseFloat(t.total_spent) || 0),
    currency:        t.currency || 'USD',
  }));

  // 4. Quick stats for the hero banner
  const { rows: [statsRow] } = await db.query(
    `SELECT
       COUNT(*)                                          AS total_trips,
       COUNT(*) FILTER (WHERE status = 'upcoming')      AS upcoming_trips,
       COUNT(*) FILTER (WHERE status = 'ongoing')       AS ongoing_trips,
       COALESCE(SUM(b.total_budget), 0)                 AS total_budget_all
     FROM trips t
     LEFT JOIN budgets b ON b.trip_id = t.id
     WHERE t.owner_id = $1 AND t.deleted_at IS NULL`,
    [userId]
  );

  res.json({
    userProfile: {
      id:              userRow.id,
      username:        `${userRow.first_name} ${userRow.last_name}`,
      firstName:       userRow.first_name,
      lastName:        userRow.last_name,
      email:           userRow.email,
      photoUrl:        userRow.avatar_url,
      city:            userRow.city,
      country:         userRow.country,
      membershipTier:  userRow.membership_tier,
    },
    destinations,
    userTrips,
    stats: {
      totalTrips:    parseInt(statsRow.total_trips),
      upcomingTrips: parseInt(statsRow.upcoming_trips),
      ongoingTrips:  parseInt(statsRow.ongoing_trips),
      totalBudget:   parseFloat(statsRow.total_budget_all),
    },
  });
});

// ── GET /api/dashboard/destinations ──────────────────────────────────────────
router.get('/destinations', authenticate, async (req, res) => {
  const {
    search  = '',
    region  = '',
    sortBy  = 'popularity',
    groupBy = 'none',
    filter  = 'all',
    page    = 1,
    limit   = 20,
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR country ILIKE $${params.length} OR region ILIKE $${params.length})`);
  }
  if (region) {
    params.push(`%${region}%`);
    conditions.push(`region ILIKE $${params.length}`);
  }
  if (filter === 'featured') {
    conditions.push(`is_featured = TRUE`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sort
  const sortMap = {
    popularity: 'popularity_score DESC, is_featured DESC',
    name:       'name ASC',
    cost_level: 'cost_level ASC',
  };
  const orderBy = sortMap[sortBy] || sortMap.popularity;

  params.push(parseInt(limit), offset);
  const { rows } = await db.query(
    `SELECT id, name, region, country, image_url, popularity_score,
            is_featured, cost_level, popularity_label
     FROM destinations
     ${where}
     ORDER BY ${orderBy}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const total = parseInt(
    (await db.query(`SELECT COUNT(*) FROM destinations ${where}`, params.slice(0, -2))).rows[0].count
  );

  // Group by region if requested
  let result;
  if (groupBy === 'region') {
    const groups = {};
    rows.forEach((d) => {
      const key = d.region || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    result = Object.entries(groups).map(([regionName, items]) => ({
      region: regionName,
      items,
    }));
  } else {
    result = rows;
  }

  res.json({ items: result, total, page: parseInt(page), limit: parseInt(limit), grouped: groupBy === 'region' });
});

module.exports = router;
