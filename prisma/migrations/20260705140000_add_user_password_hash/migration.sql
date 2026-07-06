-- Add credentials auth columns to users (NextAuth email/password)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- Enforce unique emails for signup (nullable rows remain allowed)
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");