import sharp from "sharp";
import { copyFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Regenerate all Revel platform + UI icons from the 3D keyhole master.
 *
 * Source priority:
 * 1. public/brand/revel-avatar-3d-master.jpg (1024×1024 preferred)
 * 2. public/brand/revel-avatar-3d-440.png
 * 3. public/revel-new.jpg (legacy fallback)
 */
const root = process.cwd();
const cream = { r: 247, g: 242, b: 235 };

const candidates = [
  join(root, "public/brand/revel-avatar-3d-master.jpg"),
  join(root, "public/brand/revel-avatar-3d-440.png"),
  join(root, "public/brand/revel-avatar-3d-440-okx.jpg"),
  join(root, "public/revel-new.jpg"),
];

const source = candidates.find((p) => existsSync(p));
if (!source) {
  console.error("No brand source image found. Expected one of:\n" + candidates.join("\n"));
  process.exit(1);
}
console.log(`source: ${source}`);

// Keep stable brand paths as the master raster mark
const master = join(root, "public/brand/revel-mark.jpg");
const masterPng = join(root, "public/brand/revel-icon-source.png");

await sharp(source)
  .resize(1024, 1024, { fit: "cover", position: "centre" })
  .flatten({ background: cream })
  .removeAlpha()
  .jpeg({ quality: 95, mozjpeg: true })
  .toFile(master);

await sharp(source)
  .resize(1024, 1024, { fit: "cover", position: "centre" })
  .flatten({ background: cream })
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(masterPng);

// Also refresh revel-new.jpg so older scripts stay consistent
await sharp(source)
  .resize(1024, 1024, { fit: "cover", position: "centre" })
  .flatten({ background: cream })
  .removeAlpha()
  .jpeg({ quality: 95, mozjpeg: true })
  .toFile(join(root, "public/revel-new.jpg"));

async function renderPng(size, file, { fit = "cover" } = {}) {
  await sharp(source)
    .resize(size, size, { fit, position: "centre" })
    .flatten({ background: cream })
    .removeAlpha()
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(join(root, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

async function renderJpg(size, file) {
  await sharp(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .flatten({ background: cream })
    .removeAlpha()
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(join(root, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

// Platform + browser assets + in-app marks
const pngOutputs = [
  { file: "public/favicon-16x16.png", size: 16 },
  { file: "public/favicon-32x32.png", size: 32 },
  { file: "public/icon.png", size: 32 },
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "public/android-chrome-192x192.png", size: 192 },
  { file: "public/android-chrome-512x512.png", size: 512 },
  { file: "public/brand/revel-icon.png", size: 128 },
  { file: "public/brand/revel-icon-256.png", size: 256 },
  { file: "public/brand/revel-avatar-440.png", size: 440 },
  { file: "public/brand/revel-avatar-3d-440.png", size: 440 },
  { file: "public/brand/revel-avatar-candidate-440.png", size: 440 },
];

for (const { file, size } of pngOutputs) {
  await renderPng(size, file);
}

const jpgOutputs = [
  { file: "public/brand/revel-avatar-440-okx.jpg", size: 440 },
  { file: "public/brand/revel-avatar-3d-440-okx.jpg", size: 440 },
  { file: "public/brand/revel-avatar-candidate-440.jpg", size: 440 },
];

for (const { file, size } of jpgOutputs) {
  await renderJpg(size, file);
}

// favicon.ico from 32×32
await sharp(source)
  .resize(32, 32, { fit: "cover", position: "centre" })
  .flatten({ background: cream })
  .removeAlpha()
  .png()
  .toFile(join(root, "public/favicon.ico"));
console.log("wrote public/favicon.ico (32×32)");

// Wordmark: mark + "Revel" text as PNG
const mark64 = await sharp(source)
  .resize(64, 64, { fit: "cover", position: "centre" })
  .flatten({ background: cream })
  .removeAlpha()
  .png()
  .toBuffer();

const wordmarkSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="64" viewBox="0 0 280 64">
  <rect width="280" height="64" fill="#F7F2EB"/>
  <text x="80" y="44" font-family="Georgia, 'Times New Roman', Times, serif" font-size="36" font-weight="700" letter-spacing="-0.02em" fill="#111111">Revel</text>
</svg>`);

const wordBg = await sharp(wordmarkSvg).png().toBuffer();
await sharp(wordBg)
  .composite([{ input: mark64, left: 4, top: 0 }])
  .png()
  .toFile(join(root, "public/brand/revel-logo.png"));
console.log("wrote public/brand/revel-logo.png");

// SVG stubs that point consumers at the raster mark
writeFileSync(
  join(root, "public/brand/revel-icon.svg"),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Revel">
  <image href="/brand/revel-icon.png" xlink:href="/brand/revel-icon.png" width="64" height="64" preserveAspectRatio="xMidYMid slice"/>
</svg>
`
);
console.log("wrote public/brand/revel-icon.svg (references raster mark)");

writeFileSync(
  join(root, "public/brand/revel-logo.svg"),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 48" width="200" height="48" role="img" aria-label="Revel">
  <rect width="200" height="48" fill="#F7F2EB"/>
  <image href="/brand/revel-icon.png" xlink:href="/brand/revel-icon.png" x="2" y="6" width="36" height="36" preserveAspectRatio="xMidYMid slice"/>
  <text x="48" y="33" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="700" letter-spacing="-0.02em" fill="#111111">Revel</text>
</svg>
`
);
console.log("wrote public/brand/revel-logo.svg");

// Lightweight SVG avatar placeholder (OKX still uses JPEG CDN)
writeFileSync(
  join(root, "public/brand/revel-avatar-okx.svg"),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 440 440" width="440" height="440" role="img" aria-label="Revel">
  <image href="/brand/revel-avatar-440.png" xlink:href="/brand/revel-avatar-440.png" width="440" height="440" preserveAspectRatio="xMidYMid slice"/>
</svg>
`
);
console.log("wrote public/brand/revel-avatar-okx.svg");

writeFileSync(
  join(root, "public/site.webmanifest"),
  JSON.stringify(
    {
      name: "Revel",
      short_name: "Revel",
      description:
        "Find the hidden gaps stopping your product from growing.",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      theme_color: "#F7F2EB",
      background_color: "#F7F2EB",
      display: "standalone",
      start_url: "/",
    },
    null,
    2
  )
);
console.log("wrote public/site.webmanifest");
console.log("done — all icons now use the 3D keyhole mark");
