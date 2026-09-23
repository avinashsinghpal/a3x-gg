-- Cloudflare D1 schema for the 3 modules
-- Run with: wrangler d1 execute gharpayy-crm --file=server/schema.sql

-- M-POWER CALL records -------------------------------------------------
CREATE TABLE IF NOT EXISTS call_records (
  id              TEXT PRIMARY KEY,
  called_at       TEXT NOT NULL,
  operator_id     TEXT,
  operator_name   TEXT,
  lead_ulid       TEXT NOT NULL,
  canonical_id    TEXT,
  customer_name   TEXT,
  agenda          TEXT NOT NULL,
  agenda_source   TEXT,
  outcome         TEXT NOT NULL,
  duration_sec    INTEGER,
  capture         TEXT,          -- JSON blob
  movement        TEXT,
  message_now     TEXT,
  message_sent    INTEGER DEFAULT 0,
  follow_up       TEXT,          -- JSON blob
  follow_up_state TEXT DEFAULT 'armed',
  next_step       TEXT,          -- JSON blob
  stage_after     TEXT,
  waste           TEXT,          -- JSON array blob
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_call_records_lead ON call_records(lead_ulid);
CREATE INDEX IF NOT EXISTS idx_call_records_at   ON call_records(called_at DESC);

-- Movement CARE log ----------------------------------------------------
CREATE TABLE IF NOT EXISTS movement_care_log (
  id              TEXT PRIMARY KEY,
  date            TEXT NOT NULL,
  kind            TEXT NOT NULL,  -- 'commitment' | 'report'
  operator_id     TEXT,
  operator_name   TEXT,
  role            TEXT,
  goal            TEXT,
  commit_count    INTEGER,
  actual          INTEGER,
  round           TEXT,
  moved           TEXT,
  stuck           TEXT,
  need            TEXT,
  support_needed  TEXT,
  payload         TEXT,           -- full JSON blob for anything extra
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_care_log_date ON movement_care_log(date DESC);

-- Booking Flow closing promises ----------------------------------------
CREATE TABLE IF NOT EXISTS booking_closing_promises (
  id              TEXT PRIMARY KEY,
  lead_id         TEXT NOT NULL,
  lead_name       TEXT,
  operator_name   TEXT,
  promise         TEXT NOT NULL,
  next_step       TEXT,
  deadline        TEXT,
  copied_at       TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_closing_lead ON booking_closing_promises(lead_id);

-- CRM Core Entities ----------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY,
  ulid            TEXT UNIQUE NOT NULL,
  name            TEXT,
  phone           TEXT,
  email           TEXT,
  stage           TEXT DEFAULT 'new',
  intent          TEXT DEFAULT 'neutral',
  budget          INTEGER,
  move_in_date    TEXT,
  preferred_area  TEXT,
  assignee_id     TEXT,
  assignee_name   TEXT,
  tags            TEXT,
  dossier         TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tours (
  id              TEXT PRIMARY KEY,
  lead_id         TEXT NOT NULL,
  property_id     TEXT NOT NULL,
  tcm_id          TEXT NOT NULL,
  scheduled_at    TEXT NOT NULL,
  status          TEXT DEFAULT 'scheduled',
  decision        TEXT,
  post_tour_feedback TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activities (
  id              TEXT PRIMARY KEY,
  lead_id         TEXT NOT NULL,
  type            TEXT NOT NULL,
  text            TEXT NOT NULL,
  actor_id        TEXT,
  actor_name      TEXT,
  ts              TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id              TEXT PRIMARY KEY,
  lead_id         TEXT NOT NULL,
  due_at          TEXT NOT NULL,
  priority        TEXT DEFAULT 'normal',
  text            TEXT NOT NULL,
  done            INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS handoffs (
  id              TEXT PRIMARY KEY,
  lead_id         TEXT NOT NULL,
  from_role       TEXT NOT NULL,
  from_id         TEXT NOT NULL,
  text            TEXT NOT NULL,
  priority        TEXT DEFAULT 'normal',
  read            INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id              TEXT PRIMARY KEY,
  lead_id         TEXT NOT NULL,
  property_id     TEXT NOT NULL,
  tcm_id          TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS movement_states (
  ulid            TEXT PRIMARY KEY,
  wa_account      TEXT,
  work_state      TEXT DEFAULT 'available',
  stage           TEXT DEFAULT 'lead',
  movement        TEXT DEFAULT 'none',
  next_action     TEXT,
  drafting_batch  TEXT,
  payload         TEXT,
  updated_at      TEXT DEFAULT (datetime('now'))
);
