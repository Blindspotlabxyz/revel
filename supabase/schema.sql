-- Revel V1 Database Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  website TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  score INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(analysis_id)
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_analysis_id ON reports(analysis_id);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can update own analyses" ON analyses
  FOR UPDATE USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (
    analysis_id IN (
      SELECT id FROM analyses WHERE user_id = auth.uid()::text OR user_id IS NULL
    )
  );

CREATE POLICY "Users can insert own reports" ON reports
  FOR INSERT WITH CHECK (
    analysis_id IN (
      SELECT id FROM analyses WHERE user_id = auth.uid()::text OR user_id IS NULL
    )
  );