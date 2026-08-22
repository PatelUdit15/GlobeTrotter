const router = require('express').Router();
const { body } = require('express-validator');
const db       = require('../db/db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── helper: build enriched post object ───────────────────────
async function enrichPost(post, userId) {
  const images = (await db.query(
    'SELECT * FROM post_images WHERE post_id=$1 ORDER BY sort_order', [post.id]
  )).rows;
  const tags = (await db.query(
    'SELECT * FROM post_tags WHERE post_id=$1', [post.id]
  )).rows;
  const likesCount = parseInt((await db.query(
    'SELECT COUNT(*) FROM post_likes WHERE post_id=$1', [post.id]
  )).rows[0].count);
  const savesCount = parseInt((await db.query(
    'SELECT COUNT(*) FROM post_saves WHERE post_id=$1', [post.id]
  )).rows[0].count);

  let isLiked = false, isSaved = false;
  if (userId) {
    isLiked = !!(await db.query('SELECT 1 FROM post_likes WHERE post_id=$1 AND user_id=$2', [post.id, userId])).rows.length;
    isSaved = !!(await db.query('SELECT 1 FROM post_saves WHERE post_id=$1 AND user_id=$2', [post.id, userId])).rows.length;
  }

  const author = (await db.query(
    'SELECT id, first_name, last_name, avatar_url FROM users WHERE id=$1', [post.author_id]
  )).rows[0];

  return { ...post, images, tags, likes_count: likesCount, saves_count: savesCount, is_liked: isLiked, is_saved: isSaved, author };
}

// GET /api/community/posts
router.get('/posts', optionalAuth, async (req, res) => {
  const { q, sort = 'latest', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  let where = 'WHERE p.deleted_at IS NULL';

  if (q) {
    params.push(`%${q}%`);
    where += ` AND (p.title ILIKE $${params.length} OR p.content ILIKE $${params.length} OR p.location ILIKE $${params.length})`;
  }

  const orderBy = sort === 'trending'
    ? '(SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) DESC'
    : 'p.created_at DESC';

  params.push(parseInt(limit), offset);
  const { rows } = await db.query(
    `SELECT p.* FROM community_posts p ${where}
     ORDER BY ${orderBy}
     LIMIT $${params.length-1} OFFSET $${params.length}`,
    params
  );

  const total = parseInt((await db.query(
    `SELECT COUNT(*) FROM community_posts p ${where}`, params.slice(0,-2)
  )).rows[0].count);

  const userId = req.user?.id || null;
  const items = await Promise.all(rows.map(p => enrichPost(p, userId)));

  res.json({ items, total, page: parseInt(page), limit: parseInt(limit), has_more: offset + rows.length < total });
});

// POST /api/community/posts
router.post('/posts', authenticate,
  [body('title').trim().notEmpty()],
  validate,
  async (req, res) => {
    const { title, content, location, tags = [], image_urls = [] } = req.body;

    const { rows: [post] } = await db.query(
      `INSERT INTO community_posts (author_id, title, content, location)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, title, content || null, location || null]
    );

    for (let i = 0; i < image_urls.length; i++) {
      await db.query(
        'INSERT INTO post_images (post_id, image_url, sort_order) VALUES ($1,$2,$3)',
        [post.id, image_urls[i], i]
      );
    }
    for (const tag of tags) {
      await db.query('INSERT INTO post_tags (post_id, tag) VALUES ($1,$2)', [post.id, tag.trim().toLowerCase()]);
    }

    res.status(201).json(await enrichPost(post, req.user.id));
  }
);

// GET /api/community/posts/:id
router.get('/posts/:id', optionalAuth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM community_posts WHERE id=$1 AND deleted_at IS NULL', [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Post not found' });
  res.json(await enrichPost(rows[0], req.user?.id || null));
});

// PUT /api/community/posts/:id
router.put('/posts/:id', authenticate, async (req, res) => {
  const { rows: [post] } = await db.query(
    'SELECT * FROM community_posts WHERE id=$1 AND deleted_at IS NULL', [req.params.id]
  );
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author_id !== req.user.id && !req.user.is_admin)
    return res.status(403).json({ error: 'Not your post' });

  const { title, content, location, tags, image_urls } = req.body;

  await db.query(
    `UPDATE community_posts SET
       title    = COALESCE($1, title),
       content  = COALESCE($2, content),
       location = COALESCE($3, location)
     WHERE id=$4`,
    [title||null, content||null, location||null, post.id]
  );

  if (Array.isArray(image_urls)) {
    await db.query('DELETE FROM post_images WHERE post_id=$1', [post.id]);
    for (let i = 0; i < image_urls.length; i++) {
      await db.query('INSERT INTO post_images (post_id, image_url, sort_order) VALUES ($1,$2,$3)',
        [post.id, image_urls[i], i]);
    }
  }
  if (Array.isArray(tags)) {
    await db.query('DELETE FROM post_tags WHERE post_id=$1', [post.id]);
    for (const tag of tags) {
      await db.query('INSERT INTO post_tags (post_id, tag) VALUES ($1,$2)', [post.id, tag.trim().toLowerCase()]);
    }
  }

  const updated = (await db.query('SELECT * FROM community_posts WHERE id=$1', [post.id])).rows[0];
  res.json(await enrichPost(updated, req.user.id));
});

// DELETE /api/community/posts/:id (soft delete)
router.delete('/posts/:id', authenticate, async (req, res) => {
  const { rows: [post] } = await db.query(
    'SELECT * FROM community_posts WHERE id=$1 AND deleted_at IS NULL', [req.params.id]
  );
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author_id !== req.user.id && !req.user.is_admin)
    return res.status(403).json({ error: 'Not your post' });

  await db.query('UPDATE community_posts SET deleted_at=NOW() WHERE id=$1', [post.id]);
  res.status(204).send();
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', authenticate, async (req, res) => {
  const { rows: [post] } = await db.query(
    'SELECT id FROM community_posts WHERE id=$1 AND deleted_at IS NULL', [req.params.id]
  );
  if (!post) return res.status(404).json({ error: 'Post not found' });

  try {
    await db.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1,$2)', [post.id, req.user.id]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Already liked' });
    throw e;
  }
  const count = parseInt((await db.query('SELECT COUNT(*) FROM post_likes WHERE post_id=$1', [post.id])).rows[0].count);
  res.json({ liked: true, likes_count: count });
});

// DELETE /api/community/posts/:id/like
router.delete('/posts/:id/like', authenticate, async (req, res) => {
  await db.query('DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  const count = parseInt((await db.query('SELECT COUNT(*) FROM post_likes WHERE post_id=$1', [req.params.id])).rows[0].count);
  res.json({ liked: false, likes_count: count });
});

// POST /api/community/posts/:id/save
router.post('/posts/:id/save', authenticate, async (req, res) => {
  const { rows: [post] } = await db.query(
    'SELECT id FROM community_posts WHERE id=$1 AND deleted_at IS NULL', [req.params.id]
  );
  if (!post) return res.status(404).json({ error: 'Post not found' });

  try {
    await db.query('INSERT INTO post_saves (post_id, user_id) VALUES ($1,$2)', [post.id, req.user.id]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Already saved' });
    throw e;
  }
  const count = parseInt((await db.query('SELECT COUNT(*) FROM post_saves WHERE post_id=$1', [post.id])).rows[0].count);
  res.json({ saved: true, saves_count: count });
});

// DELETE /api/community/posts/:id/save
router.delete('/posts/:id/save', authenticate, async (req, res) => {
  await db.query('DELETE FROM post_saves WHERE post_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  const count = parseInt((await db.query('SELECT COUNT(*) FROM post_saves WHERE post_id=$1', [req.params.id])).rows[0].count);
  res.json({ saved: false, saves_count: count });
});

// GET /api/community/trending-destinations
router.get('/trending-destinations', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const { rows } = await db.query(
    `SELECT p.location, COUNT(p.id) AS posts_count
     FROM community_posts p
     WHERE p.deleted_at IS NULL AND p.location IS NOT NULL
     GROUP BY p.location ORDER BY posts_count DESC LIMIT $1`,
    [limit]
  );
  const result = await Promise.all(rows.map(async r => {
    const city = (await db.query('SELECT * FROM cities WHERE name ILIKE $1 LIMIT 1', [`%${r.location}%`])).rows[0];
    return {
      name: r.location,
      country: city?.country || '',
      posts_count: parseInt(r.posts_count),
      cover_image_url: city?.cover_image_url || null,
    };
  }));
  res.json(result);
});

// GET /api/community/top-contributors
router.get('/top-contributors', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const { rows } = await db.query(
    `SELECT p.author_id, COUNT(p.id) AS posts_count
     FROM community_posts p WHERE p.deleted_at IS NULL
     GROUP BY p.author_id ORDER BY posts_count DESC LIMIT $1`,
    [limit]
  );

  const result = await Promise.all(rows.map(async r => {
    const user = (await db.query(
      'SELECT id, first_name, last_name, avatar_url FROM users WHERE id=$1', [r.author_id]
    )).rows[0];
    const likesReceived = parseInt((await db.query(
      `SELECT COUNT(*) FROM post_likes l
       JOIN community_posts p ON p.id = l.post_id
       WHERE p.author_id=$1`, [r.author_id]
    )).rows[0].count);
    return { user, posts_count: parseInt(r.posts_count), likes_received: likesReceived };
  }));
  res.json(result);
});

module.exports = router;
