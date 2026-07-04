/**
 * Ping IndexNow after Vercel production builds.
 * Runs via package.json postbuild when VERCEL_ENV=production.
 *
 * Requires NEXT_PUBLIC_APP_URL=https://tryrevel.xyz on the Vercel project.
 * Set INDEXNOW_DISABLED=true to skip (e.g. preview pipelines).
 */

const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
];

const PUBLIC_PATHS = [
  "/",
  "/how-it-works",
  "/features",
  "/pricing",
  "/faq",
  "/sample-reports",
  "/about",
  "/contact",
  "/docs",
  "/docs/api",
  "/privacy",
  "/terms",
  "/llms.txt",
  "/llms-full.txt",
  "/ai.txt",
];

const force = process.argv.includes("--force");

function shouldRun() {
  if (force) {
    return true;
  }

  if (process.env.INDEXNOW_DISABLED === "true") {
    return false;
  }

  if (!process.env.VERCEL) {
    return false;
  }

  return process.env.VERCEL_ENV === "production";
}

function siteUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://tryrevel.xyz";
  return url.replace(/\/$/, "");
}

async function submitToIndexNow() {
  const base = siteUrl();
  const host = new URL(base).host;
  const key = process.env.INDEXNOW_KEY ?? "revel-tryrevel-indexnow";
  const keyLocation = `${base}/${key}.txt`;
  const urlList = PUBLIC_PATHS.map((path) => `${base}${path}`);

  const body = { host, key, keyLocation, urlList };

  const results = await Promise.all(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });
      return { endpoint, status: response.status };
    })
  );

  return { urlList, results };
}

async function main() {
  if (!shouldRun()) {
    console.log("[indexnow] Skipped (not a production Vercel build).");
    return;
  }

  try {
    const { urlList, results } = await submitToIndexNow();
    const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";

    console.log(
      `[indexnow] Submitted ${urlList.length} URLs after deploy ${sha}.`
    );
    for (const { endpoint, status } of results) {
      console.log(`[indexnow] ${endpoint} → ${status}`);
    }
  } catch (error) {
    // Never fail the build — indexing is best-effort
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[indexnow] Ping failed (non-fatal): ${message}`);
  }
}

main();