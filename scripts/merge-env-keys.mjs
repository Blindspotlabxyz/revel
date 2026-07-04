/**
 * Append missing keys from .env.example into .env.local without overwriting values.
 * Does not print secret values.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const examplePath = join(root, ".env.example");
const localPath = join(root, ".env.local");

if (!existsSync(examplePath)) {
  console.error("Missing .env.example");
  process.exit(1);
}

const example = readFileSync(examplePath, "utf8");
const local = existsSync(localPath) ? readFileSync(localPath, "utf8") : "";

const existingKeys = new Set(
  local
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim())
);

const templateKeys = example
  .split("\n")
  .filter((line) => {
    const t = line.trim();
    return t && !t.startsWith("#") && t.includes("=");
  })
  .map((line) => line.split("=")[0].trim());

const missing = templateKeys.filter((key) => !existingKeys.has(key));

if (missing.length === 0) {
  console.log("[env] .env.local already has all template keys.");
  process.exit(0);
}

const block = [
  "",
  "# --- Added by scripts/merge-env-keys.mjs ---",
  ...missing.map((key) => {
    const line = example
      .split("\n")
      .find((l) => l.trim().startsWith(`${key}=`));
    return line?.trim() ?? `${key}=`;
  }),
  "",
].join("\n");

writeFileSync(localPath, local.trimEnd() + block, "utf8");
console.log(`[env] Appended ${missing.length} key(s) to .env.local:`);
for (const key of missing) {
  console.log(`  - ${key}`);
}