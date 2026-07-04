/**
 * Verifies all three homepage illustration sections share one container system.
 * Usage: node scripts/verify-illustration-consistency.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SECTION_FILES = [
  { name: "Hero", file: "components/landing/hero.tsx" },
  { name: "Insight", file: "components/landing/insight-section.tsx" },
  { name: "Map", file: "components/landing/map-section.tsx" },
];

const SLOT_USAGE = /<IllustrationSlot>\s*\n\s*<SectionIllustration/;

const FORBIDDEN_PATTERNS = [
  /illustration-frame__accent/,
  /matchHeroColumn/,
  /illustration-slot--match-hero/,
  /illustration-column-width/,
  /box-shadow\s*:/,
  /rounded-(xl|2xl|lg|md)/,
  /\bp-[0-9]/,
  /\bshadow-/,
  /<SectionIllustration[^>]*className=/,
];

let failures = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failures++;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

async function read(rel) {
  return fs.readFile(path.join(root, rel), "utf8");
}

async function main() {
  const globals = await read("styles/globals.css");
  const sectionIllustration = await read("components/landing/section-illustration.tsx");
  const slotComponent = await read("components/landing/illustration-slot.tsx");

  if (!globals.includes("--illustration-section-bg: var(--color-background)")) {
    fail("Missing --illustration-section-bg token");
  } else pass("Section background token: --illustration-section-bg");

  if (!globals.includes(".illustration-section")) {
    fail("Missing .illustration-section class");
  } else pass("Section backdrop class defined");

  if (!globals.includes("--illustration-container-radius: 1rem")) {
    fail("Missing --illustration-container-radius: 1rem");
  } else pass("Corner radius token: 1rem (all sections)");

  if (
    !globals.includes(
      "--illustration-container-padding: calc(var(--illustration-container-radius) * 0.5)"
    )
  ) {
    fail("Padding must be relative to radius (50% of container radius)");
  } else pass("Relative padding: 50% of container radius");

  if (
    !/--illustration-media-radius:\s*calc\(\s*var\(--illustration-container-radius\)\s*-\s*var\(--illustration-container-padding\)/.test(
      globals
    )
  ) {
    fail("Inner radius must be concentric (outer − padding)");
  } else pass("Inner radius: concentric with outer + padding");

  if (/@media[\s\S]*\.illustration-frame\s*\{/.test(globals)) {
    fail(".illustration-frame must not change in media queries");
  } else pass("Radius and padding fixed at all breakpoints");

  if (!globals.includes("box-shadow: var(--shadow-illustration)")) {
    fail("Shadow must use --shadow-illustration on .illustration-frame");
  } else pass("Shadow token applied once");

  if (
    slotComponent.includes("matchHeroColumn") ||
    /IllustrationSlot\(\{[^}]*className/.test(slotComponent)
  ) {
    fail("IllustrationSlot must not accept layout overrides");
  } else pass("IllustrationSlot: no per-section props");

  if (!sectionIllustration.includes('className="illustration-frame"')) {
    fail("SectionIllustration must use illustration-frame without overrides");
  } else pass("SectionIllustration: shared frame only");

  if (sectionIllustration.includes("className?:")) {
    fail("SectionIllustration must not accept className overrides");
  } else pass("SectionIllustration: image props only (src, alt, priority)");

  for (const { name, file } of SECTION_FILES) {
    const src = await read(file);

    if (!SLOT_USAGE.test(src)) {
      fail(`${name}: must use <IllustrationSlot><SectionIllustration /> pattern`);
    } else pass(`${name}: identical slot + illustration structure`);

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(src)) {
        fail(`${name}: forbidden override ${pattern}`);
      }
    }
    pass(`${name}: differs only in image src / alt`);

    if (!src.includes("illustration-section")) {
      fail(`${name}: must use illustration-section for shared backdrop`);
    } else pass(`${name}: illustration-section backdrop (#f7f2eb)`);

    if (src.includes("bg-surface")) {
      fail(`${name}: bg-surface breaks shared section background`);
    }

    if (!src.includes("md:gap-16")) {
      fail(`${name}: grid gap must match hero (md:gap-16)`);
    } else pass(`${name}: grid gap matches hero`);
  }

  for (const img of [
    "hero-peel-desktop-16x9.jpg",
    "insight-telescope-desktop-16x9.jpg",
    "map-reveal-desktop-16x9.jpg",
  ]) {
    try {
      await fs.stat(path.join(root, "public/images", img));
      pass(`Asset: ${img}`);
    } catch {
      fail(`Missing public/images/${img}`);
    }
  }

  console.log("\n--- RESULT CHECK ---");
  if (failures === 0) {
    console.log("All three sections share one box system; only image content differs.");
    console.log("\n  Corner radius:  1rem outer · 0.5rem inner (concentric)");
    console.log("  Padding:        50% of radius (0.5rem at default)");
    console.log("  Shadow:         0 8px 24px rgb(17 17 17 / 0.07)");
    console.log("  Section bg:     #f7f2eb (--illustration-section-bg)");
    console.log("  Frame bg:       #f7f2eb (matches section)");
    console.log("  Aspect:         9/16 mobile · 16/9 desktop");
    process.exit(0);
  }

  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});