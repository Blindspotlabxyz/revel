import { config } from "dotenv";
import pg from "pg";
import { readFileSync } from "fs";

config({ path: ".env.local" });

function resolveDatabaseUrl(url) {
  if (!url) throw new Error("Database URL is not set");

  try {
    new URL(url);
    return url;
  } catch {
    const prefix = "postgresql://";
    const rest = url.slice(prefix.length);
    const hostMarker = rest.search(/@(aws-|db\.)/);
    const credentials = rest.slice(0, hostMarker);
    const hostAndPath = rest.slice(hostMarker + 1);
    const separator = credentials.indexOf(":");
    const user = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);
    return `${prefix}${encodeURIComponent(user)}:${encodeURIComponent(password)}@${hostAndPath}`;
  }
}

const client = new pg.Client({
  connectionString: resolveDatabaseUrl(
    process.env.DIRECT_URL ?? process.env.DATABASE_URL
  ),
  connectionTimeoutMillis: 15000,
});

await client.connect();

const sql = readFileSync(
  "prisma/migrations/20260705140000_add_user_password_hash/migration.sql",
  "utf8"
);

await client.query(sql);

const { rows } = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'password_hash'
`);

console.log(
  rows.length
    ? "Migration applied: users.password_hash exists"
    : "Migration failed: password_hash column still missing"
);

await client.end();