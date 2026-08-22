const router = require('express').Router();
const { body } = require('express-validator');
const { query }      = require('../db/db');
const { authenticate } = require('../middleware/auth');
const validate         = require('../middleware/validate');
const upload           = require('../middleware/upload');

// ── GET /api/users/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  const { rows } = await query(
    `SELECT id, email, first_name, last_name, phone, city, country,
            bio, avatar_url, membership_tier, is_active, is_admin, created_at, updated_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json(rows[0]);
});

// ── PUT /api/users/me ─────────────────────────────────────────────────────────
router.put(
  '/me',
  authenticate,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('first_name').optional().trim().notEmpty(),
    body('last_name').optional().trim().notEmpty(),
  ],
  validate,
  async (req, res) => {
    const { first_name, last_name, email, phone, city, country, bio } = req.body;

    // Email uniqueness check
    if (email && email !== req.user.email) {
      const clash = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (clash.rows.length) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const { rows } = await query(
      `UPDATE users
       SET first_name  = COALESCE($1, first_name),
           last_name   = COALESCE($2, last_name),
           email       = COALESCE($3, email),
           phone       = COALESCE($4, phone),
           city        = COALESCE($5, city),
           country     = COALESCE($6, country),
           bio         = COALESCE($7, bio)
       WHERE id = $8
       RETURNING id, email, first_name, last_name, phone, city, country,
                 bio, avatar_url, membership_tier, is_active, is_admin, updated_at`,
      [first_name || null, last_name || null, email || null,
       phone || null, city || null, country || null, bio || null, req.user.id]
    );
    res.json(rows[0]);
  }
);

// ── POST /api/users/me/avatar  (upload avatar) ────────────────────────────────
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const url = `/uploads/avatars/${req.file.filename}`;
  await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [url, req.user.id]);
  res.json({ url, filename: req.file.filename, size_bytes: req.file.size });
});

module.exports = router;
