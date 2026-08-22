const router = require('express').Router();
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const db = require('../db/db');

// POST /api/uploads/avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/avatars/${req.file.filename}`;
  await db.query('UPDATE users SET avatar_url=$1 WHERE id=$2', [url, req.user.id]);
  res.json({ url, filename: req.file.filename, size_bytes: req.file.size });
});

// POST /api/uploads/cover-image
router.post('/cover-image', authenticate, upload.single('cover'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/covers/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size_bytes: req.file.size });
});

// POST /api/uploads/post-image
router.post('/post-image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/posts/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size_bytes: req.file.size });
});

module.exports = router;
