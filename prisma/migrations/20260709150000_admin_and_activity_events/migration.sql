-- Admin flag on users + activity event log for analytics
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "activity_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_type" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "user_id" TEXT,
  "tool_name" TEXT,
  "analysis_id" UUID,
  "website" TEXT,
  "status" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  CONSTRAINT "activity_events_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_activity_events_created_at" ON "activity_events" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_activity_events_event_type" ON "activity_events" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_activity_events_source" ON "activity_events" ("source");
CREATE INDEX IF NOT EXISTS "idx_activity_events_user_id" ON "activity_events" ("user_id");

-- Grant yourself admin (replace email if needed)
UPDATE "users" SET "is_admin" = true WHERE email = 'mojeeb.eth@gmail.com';