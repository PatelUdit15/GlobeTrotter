-- ============================================================
-- Migration 001 — Dashboard enhancements
-- ============================================================

-- 1. Add popularity_score to cities (maps to the destinations table
--    requested in the spec; we reuse the existing cities table rather
--    than duplicating data).
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS popularity_score INTEGER NOT NULL DEFAULT 0;

-- 2. Seed initial popularity scores based on is_featured + cost_level
UPDATE cities SET popularity_score =
  CASE
    WHEN is_featured = TRUE  THEN 80 + (4 - cost_level) * 5
    ELSE                           40 + (4 - cost_level) * 5
  END;

-- 3. Create a convenience view that matches the "destinations" name
--    used in the spec, so the route can query it directly.
DROP VIEW IF EXISTS destinations;
CREATE VIEW destinations AS
  SELECT
    id,
    name,
    region,
    country,
    cover_image_url,
    cover_image_url  AS image_url,
    popularity_score,
    is_featured,
    cost_level,
    popularity_label
  FROM cities;
