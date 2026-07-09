-- Run in Supabase SQL Editor — Partner API tables + Arcapush seed

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  access_type TEXT NOT NULL DEFAULT 'paid',
  credits_balance INTEGER NOT NULL DEFAULT 0,
  monthly_quota INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  label TEXT,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL UNIQUE REFERENCES analyses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partner_api_keys_prefix ON partner_api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_partner_analyses_partner_id ON partner_analyses(partner_id);

INSERT INTO partners (name, domain, contact_email, status, access_type, notes)
VALUES (
  'Arcapush',
  'arcapush.com',
  'mojeeb.eth@gmail.com',
  'pending',
  'whitelisted',
  'Approve from Mission Control → Partners, then issue API key'
)
ON CONFLICT (domain) DO NOTHING;