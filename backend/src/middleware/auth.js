const jwt = require('jsonwebtoken');
const { query } = require('../db/db');

/**
 * Verify JWT access token — attaches req.user = { id, email, is_admin }
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const { rows } = await query(
      'SELECT id, email, is_admin, is_active FROM users WHERE id = $1',
      [payload.userId]
    );
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional auth — attaches req.user if token present, otherwise continues
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type === 'access') {
      const { rows } = await query(
        'SELECT id, email, is_admin, is_active FROM users WHERE id = $1',
        [payload.userId]
      );
      if (rows.length && rows[0].is_active) req.user = rows[0];
    }
  } catch (_) { /* ignore */ }
  next();
};

/**
 * Require is_admin = true
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin };
