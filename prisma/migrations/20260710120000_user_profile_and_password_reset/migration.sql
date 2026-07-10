-- Profile fields + password reset tokens
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users" ("username");
