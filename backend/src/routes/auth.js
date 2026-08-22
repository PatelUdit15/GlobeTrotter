const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body } = require('express-validator');
const { query } = require('../db/db');
const validate  = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// ── helpers ───────────────────────────────────────────────────────────────────

function signAccess(userId, isAdmin) {
  return jwt.sign(
    { userId, isAdmin, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );
}

function signRefresh(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
}

async function storeRefresh(userId, token) {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000).toISOString();
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
}

function issueTokens(user) {
  const access  = signAccess(user.id, user.is_admin);
  const refresh = signRefresh(user.id);
  return { access, refresh };
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post(
  '/signup',
  [
    body('email').trim().isEmail(),
    body('password').isLength({ min: 6 }),
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
  ],
  validate,
  async (req, res) => {
    const email    = req.body.email.trim().toLowerCase();
    const { password, first_name, last_name, phone, city, country } = req.body;

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, city, country)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [email, hash, first_name, last_name, phone || null, city || null, country || null]
    );
    const user = rows[0];

    const { access, refresh } = issueTokens(user);
    await storeRefresh(user.id, refresh);

    delete user.password_hash;
    res.status(201).json({ access_token: access, refresh_token: refresh, user });
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').trim().isEmail(),   // no normalizeEmail — keep original case for lookup
    body('password').notEmpty(),
  ],
  validate,
  async (req, res) => {
    const email    = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const { rows } = await query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account deactivated. Contact support.' });
    }

    const { access, refresh } = issueTokens(user);
    await storeRefresh(user.id, refresh);

    delete user.password_hash;
    res.json({ access_token: access, refresh_token: refresh, user });
  }
);

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  let payload;
  try {
    payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  if (payload.type !== 'refresh') {
    return res.status(401).json({ error: 'Wrong token type' });
  }

  const { rows } = await query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = FALSE',
    [refresh_token]
  );
  if (!rows.length || new Date(rows[0].expires_at) < new Date()) {
    return res.status(401).json({ error: 'Refresh token invalid or expired' });
  }

  // Rotate — revoke old, issue new
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [rows[0].id]);

  const userRes = await query(
    'SELECT id, is_admin, is_active FROM users WHERE id = $1',
    [payload.userId]
  );
  const user = userRes.rows[0];
  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  const access  = signAccess(user.id, user.is_admin);
  const refresh = signRefresh(user.id);
  await storeRefresh(user.id, refresh);

  res.json({ access_token: access, refresh_token: refresh });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) {
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1', [refresh_token]);
  }
  res.status(204).send();
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  const { rows } = await query(
    `SELECT id, email, first_name, last_name, phone, city, country,
            bio, avatar_url, membership_tier, is_active, is_admin, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json(rows[0]);
});

module.exports = router;
