-- Per-user OAuth connections for private Linear / Notion / GitHub Gist exports
CREATE TABLE IF NOT EXISTS "user_integrations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" TEXT NOT NULL,
  "access_token_encrypted" TEXT NOT NULL,
  "refresh_token_encrypted" TEXT,
  "token_expires_at" TIMESTAMPTZ(6),
  "scopes" TEXT,
  "metadata" JSONB,
  "connected_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_integrations_user_provider_key"
  ON "user_integrations" ("user_id", "provider");

CREATE INDEX IF NOT EXISTS "idx_user_integrations_user_id"
  ON "user_integrations" ("user_id");
