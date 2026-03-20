-- Migration: Google Calendar Integration
-- Adds google_calendar_tokens table and google_event_id column to pantry_appointments

-- ============================================================================
-- GOOGLE CALENDAR TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  is_connected  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_user_id ON google_calendar_tokens(user_id);

-- ============================================================================
-- EXTEND PANTRY APPOINTMENTS
-- ============================================================================

ALTER TABLE pantry_appointments
  ADD COLUMN IF NOT EXISTS google_event_id TEXT;
