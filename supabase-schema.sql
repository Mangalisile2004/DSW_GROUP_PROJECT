-- ============================================================
-- Campus Connect — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Service Seekers (students looking for services)
CREATE TABLE IF NOT EXISTS service_seekers (
  id             BIGSERIAL PRIMARY KEY,
  full_name      TEXT NOT NULL,
  surname        TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  service_needed TEXT,
  student_number TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Service Providers (students offering services)
CREATE TABLE IF NOT EXISTS service_providers (
  id             BIGSERIAL PRIMARY KEY,
  full_name      TEXT NOT NULL,
  surname        TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  student_number TEXT,
  password_hash  TEXT NOT NULL,
  service_type   TEXT NOT NULL,
  bio            TEXT,
  hourly_rate    NUMERIC(10, 2),
  campus         TEXT,
  availability   TEXT,
  rating         NUMERIC(3, 1) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- The server uses the service_role key which bypasses RLS.
-- Enable RLS as a best-practice safety net anyway.
-- ============================================================
ALTER TABLE service_seekers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages   ENABLE ROW LEVEL SECURITY;

-- Deny all access from the anon/public role (server uses service_role)
CREATE POLICY "deny_anon_seekers"   ON service_seekers   FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_providers" ON service_providers FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_contact"   ON contact_messages  FOR ALL TO anon USING (false);

-- ── SERVICES TABLE ───────────────────────────────────────────
-- Stores service listings published by providers.
CREATE TABLE IF NOT EXISTS services (
  id            BIGSERIAL    PRIMARY KEY,
  provider_id   BIGINT       REFERENCES service_providers(id) ON DELETE CASCADE,
  title         TEXT         NOT NULL,
  category      TEXT         NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2),
  price_type    TEXT         DEFAULT 'hourly', -- 'hourly', 'fixed', 'monthly'
  campus        TEXT,
  availability  TEXT,
  tags          TEXT,
  image_url     TEXT,
  is_active     BOOLEAN      DEFAULT true,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny_anon_services" ON services FOR ALL TO anon USING (false);
