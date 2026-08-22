require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');

const app = express();

// ── ensure upload dirs exist ──────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
['avatars', 'covers', 'posts'].forEach(sub => {
  const dir = path.join(UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── middleware ────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── static uploads ────────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// ── routes ────────────────────────────────────────────────────
const authRoutes          = require('./routes/auth');
const userRoutes          = require('./routes/users');
const dashboardRoutes     = require('./routes/dashboard');
const tripRoutes          = require('./routes/trips');
const stopsRoutes         = require('./routes/stops');
const activitiesRoutes    = require('./routes/activities');
const budgetRoutes        = require('./routes/budget');
const expensesRoutes      = require('./routes/expenses');
const citiesRoutes        = require('./routes/cities');
const tripTemplateRoutes  = require('./routes/tripTemplates');
const communityRoutes     = require('./routes/community');
const adminRoutes         = require('./routes/admin');
const uploadsRoutes       = require('./routes/uploads');

app.use('/api/auth',           authRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/trips',          tripRoutes);

// Nested stop / activity / budget / expense routes
app.use('/api/trips/:tripId/stops',                                  stopsRoutes);
app.use('/api/trips/:tripId/stops/:stopId/activities',               activitiesRoutes);
app.use('/api/trips/:tripId/budget',                                 budgetRoutes);
app.use('/api/trips/:tripId/expenses',                               expensesRoutes);

app.use('/api/cities',         citiesRoutes);
app.use('/api/trip-templates', tripTemplateRoutes);
app.use('/api/community',      communityRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/uploads',        uploadsRoutes);

// ── health check ──────────────────────────────────────────────
app.get('/',        (_req, res) => res.json({ message: 'GlobeTrotter API is running 🌍' }));
app.get('/health',  (_req, res) => res.json({ status: 'ok' }));

// ── global error handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);
  if (err.message?.startsWith('CORS')) return res.status(403).json({ error: err.message });
  if (err.name === 'MulterError') return res.status(400).json({ error: err.message });
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

// ── start ─────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  GlobeTrotter API running on http://localhost:${PORT}`);
  console.log(`📄  Docs:   http://localhost:${PORT}/`);
  console.log(`🩺  Health: http://localhost:${PORT}/health\n`);
});
