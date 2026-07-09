-- Partner API: platforms integrate Revel via API keys (whitelist or paid credits)

CREATE TABLE IF NOT EXISTS "partners" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "domain" TEXT UNIQUE,
  "contact_email" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "access_type" TEXT NOT NULL DEFAULT 'paid',
  "credits_balance" INTEGER NOT NULL DEFAULT 0,
  "monthly_quota" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "partner_api_keys" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "partner_id" UUID NOT NULL,
  "key_prefix" TEXT NOT NULL,
  "key_hash" TEXT NOT NULL,
  "label" TEXT,
  "last_used_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  CONSTRAINT "partner_api_keys_partner_id_fkey"
    FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "partner_analyses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "partner_id" UUID NOT NULL,
  "analysis_id" UUID NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  CONSTRAINT "partner_analyses_partner_id_fkey"
    FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "partner_analyses_analysis_id_fkey"
    FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_partners_status" ON "partners" ("status");
CREATE INDEX IF NOT EXISTS "idx_partners_access_type" ON "partners" ("access_type");
CREATE INDEX IF NOT EXISTS "idx_partner_api_keys_prefix" ON "partner_api_keys" ("key_prefix");
CREATE INDEX IF NOT EXISTS "idx_partner_api_keys_partner_id" ON "partner_api_keys" ("partner_id");
CREATE INDEX IF NOT EXISTS "idx_partner_analyses_partner_id" ON "partner_analyses" ("partner_id");

-- Seed Arcapush as whitelisted partner (generate API key from admin dashboard after deploy)
INSERT INTO "partners" ("name", "domain", "contact_email", "status", "access_type", "notes")
VALUES (
  'Arcapush',
  'arcapush.com',
  'mojeeb.eth@gmail.com',
  'pending',
  'whitelisted',
  'Founder product — approve and issue API key from admin dashboard'
)
ON CONFLICT ("domain") DO NOTHING;