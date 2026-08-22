-- ============================================================
-- GlobeTrotter – PostgreSQL Schema
-- Run: node src/db/runSchema.js
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enum types ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE membership_tier  AS ENUM ('free', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE trip_status      AS ENUM ('draft', 'upcoming', 'ongoing', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE trip_visibility  AS ENUM ('private', 'public');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE activity_category AS ENUM (
    'sightseeing', 'dining', 'transport', 'accommodation', 'activity', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'flights', 'accommodation', 'activities', 'food', 'transport', 'shopping', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE expense_status AS ENUM ('paid', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  phone            VARCHAR(30),
  city             VARCHAR(100),
  country          VARCHAR(100),
  bio              TEXT,
  avatar_url       VARCHAR(500),
  membership_tier  membership_tier NOT NULL DEFAULT 'free',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  is_admin         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── refresh_tokens ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token   ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ── trips ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id               SERIAL PRIMARY KEY,
  owner_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  cover_image_url  VARCHAR(500),
  start_date       DATE,
  end_date         DATE,
  status           trip_status NOT NULL DEFAULT 'draft',
  visibility       trip_visibility NOT NULL DEFAULT 'private',
  view_count       INTEGER NOT NULL DEFAULT 0,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_status   ON trips(status);

-- ── trip_stops ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_stops (
  id               SERIAL PRIMARY KEY,
  trip_id          INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name        VARCHAR(100) NOT NULL,
  country          VARCHAR(100),
  latitude         NUMERIC(10,6),
  longitude        NUMERIC(10,6),
  arrival_date     DATE,
  departure_date   DATE,
  duration_nights  INTEGER NOT NULL DEFAULT 1,
  accommodation    VARCHAR(255),
  notes            TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);

-- ── activities ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id                 SERIAL PRIMARY KEY,
  stop_id            INTEGER NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  name               VARCHAR(255) NOT NULL,
  description        TEXT,
  start_time         VARCHAR(10),   -- "HH:MM"
  end_time           VARCHAR(10),
  cost               NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency           VARCHAR(10) NOT NULL DEFAULT 'USD',
  category           activity_category NOT NULL DEFAULT 'activity',
  added_by_user_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activities_stop_id ON activities(stop_id);

-- ── budgets ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id            SERIAL PRIMARY KEY,
  trip_id       INTEGER NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  total_budget  NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      VARCHAR(10) NOT NULL DEFAULT 'USD',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── expenses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id           SERIAL PRIMARY KEY,
  trip_id      INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  description  VARCHAR(255) NOT NULL,
  category     expense_category NOT NULL DEFAULT 'other',
  amount       NUMERIC(10,2) NOT NULL,
  currency     VARCHAR(10) NOT NULL DEFAULT 'USD',
  date         DATE,
  status       expense_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);

-- ── cities ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  country           VARCHAR(100) NOT NULL,
  region            VARCHAR(100),
  description       TEXT,
  cover_image_url   VARCHAR(500),
  popularity_label  VARCHAR(50),
  cost_level        INTEGER NOT NULL DEFAULT 2 CHECK (cost_level BETWEEN 1 AND 4),
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- ── trip_templates ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_templates (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(255) NOT NULL,
  category          VARCHAR(100),
  description       TEXT,
  duration_days     INTEGER,
  estimated_budget  NUMERIC(10,2),
  currency          VARCHAR(10) NOT NULL DEFAULT 'USD',
  cover_image_url   VARCHAR(500),
  badge             VARCHAR(50),
  tags              VARCHAR(500),    -- comma-separated
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── community_posts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id          SERIAL PRIMARY KEY,
  author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  content     TEXT,
  location    VARCHAR(255),
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);

-- ── post_images ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_images (
  id          SERIAL PRIMARY KEY,
  post_id     INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  image_url   VARCHAR(500) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ── post_tags ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_tags (
  id       SERIAL PRIMARY KEY,
  post_id  INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  tag      VARCHAR(100) NOT NULL
);

-- ── post_likes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- ── post_saves ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_saves (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- ── trip_shares ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_shares (
  id         SERIAL PRIMARY KEY,
  trip_id    INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

-- ── updated_at trigger function ───────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach trigger to tables with updated_at
DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','trips','budgets','expenses','community_posts']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
      CREATE TRIGGER trg_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t, t, t, t);
  END LOOP;
END $$;
