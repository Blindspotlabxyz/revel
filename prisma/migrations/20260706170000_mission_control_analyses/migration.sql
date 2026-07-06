-- Mission Control: analyses + reports storage (Prisma / Supabase)
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT,
  "password_hash" TEXT,
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "analyses" (
  "id" UUID PRIMARY KEY,
  "user_id" TEXT,
  "website" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'processing',
  "score" INTEGER,
  "error" TEXT,
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  CONSTRAINT "analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "analysis_id" UUID NOT NULL,
  "json_result" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  CONSTRAINT "reports_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "reports_analysis_id_key" ON "reports" ("analysis_id");
CREATE INDEX IF NOT EXISTS "idx_analyses_user_id" ON "analyses" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_analyses_created_at" ON "analyses" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_reports_analysis_id" ON "reports" ("analysis_id");