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
  connectionString: resolveDatabaseUrl(process.env.DIRECT_URL),
  connectionTimeoutMillis: 15000,
});

await client.connect();

const { rows } = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('users', 'analyses', 'reports')
  ORDER BY table_name
`);

const existing = rows.map((row) => row.table_name);
console.log("existing_tables:", existing.join(", ") || "none");

if (existing.length < 3) {
  const sql = readFileSync("supabase/schema.sql", "utf8");
  await client.query(sql);
  console.log("schema_applied: true");
} else {
  console.log("schema_applied: skipped");
}

await client.end();