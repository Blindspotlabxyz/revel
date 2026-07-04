/**
 * Captures side-by-side before/after illustration container diff.
 * Usage: node scripts/capture-illustration-diff.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import fs from "fs";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const outPath = path.join(publicDir, "images", "illustration-consistency-diff.png");
const PORT = 4173;

function serveStatic() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = req.url === "/" ? "/illustration-diff.html" : req.url;
      const filePath = path.join(publicDir, url.replace(/^\//, "").split("?")[0]);
      if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      const types = {
        ".html": "text/html",
        ".jpg": "image/jpeg",
        ".png": "image/png",
      };
      res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, () => resolve(server));
  });
}

spawnSync("npx", ["-y", "playwright", "install", "chromium"], {
  cwd: root,
  shell: true,
  stdio: "inherit",
});

const server = await serveStatic();

try {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:${PORT}/illustration-diff.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log(`Saved: ${outPath}`);
} catch (err) {
  console.error("Capture failed:", err.message);
  console.error("Open http://localhost:3000/illustration-diff.html manually if dev server is running.");
  process.exit(1);
} finally {
  server.close();
}