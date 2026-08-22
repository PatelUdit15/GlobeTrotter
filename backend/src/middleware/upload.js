const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB   = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
const UPLOAD_DIR    = process.env.UPLOAD_DIR || 'uploads';

// Ensure sub-directories exist
['avatars', 'covers', 'posts'].forEach((sub) => {
  const dir = path.join(UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Choose sub-folder based on the route path
    let sub = 'posts';
    if (req.path.includes('avatar'))       sub = 'avatars';
    else if (req.path.includes('cover'))   sub = 'covers';
    cb(null, path.join(UPLOAD_DIR, sub));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = upload;
