-- Run in Supabase SQL Editor
-- Adds is_admin, activity_events table, and grants admin to your account.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  tool_name TEXT,
  analysis_id UUID,
  website TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_event_type ON activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_source ON activity_events(source);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON activity_events(user_id);

-- Grant admin to your Mission Control account
UPDATE users SET is_admin = true WHERE email = 'mojeeb.eth@gmail.com';

-- Verify
SELECT id, email, is_admin, created_at FROM users WHERE is_admin = true;