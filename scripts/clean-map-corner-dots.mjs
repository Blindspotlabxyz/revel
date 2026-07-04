/**
 * Removes white grommet placeholder dots from map-reveal images.
 * Uses tight circular masks at known grommet positions only.
 *
 * Usage: node scripts/clean-map-corner-dots.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");

const GROMMETS = {
  "map-reveal-desktop-16x9.jpg": [
    [0.082, 0.168, 11],
    [0.082, 0.832, 11],
    [0.918, 0.832, 11],
  ],
  "map-reveal-mobile-9x16.jpg": [
    [0.125, 0.108, 10],
    [0.125, 0.892, 10],
    [0.875, 0.892, 10],
  ],
};

async function sampleCoral(image, cx, cy, radius) {
  const { data, info } = await image
    .clone()
    .extract({
      left: Math.max(0, cx + radius + 4),
      top: Math.max(0, cy - 6),
      width: 12,
      height: 12,
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0;
  let g = 0;
  let b = 0;
  const count = data.length / info.channels;
  for (let i = 0; i < data.length; i += info.channels) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

async function cleanFile(filename, dots) {
  const input = path.join(imagesDir, filename);
  const temp = path.join(imagesDir, `.tmp-${filename}`);
  const image = sharp(input);
  const { width, height } = await image.metadata();

  const overlays = [];
  for (const [fx, fy, radius] of dots) {
    const cx = Math.round(fx * width);
    const cy = Math.round(fy * height);
    const color = await sampleCoral(image, cx, cy, radius);
    const size = radius * 2;
    const fill = `rgb(${color.r},${color.g},${color.b})`;
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="${fill}"/></svg>`;
    overlays.push({
      input: Buffer.from(svg),
      top: Math.max(0, cy - radius),
      left: Math.max(0, cx - radius),
    });
  }

  await image.composite(overlays).jpeg({ quality: 93 }).toFile(temp);
  await fs.rename(temp, input);
  console.log(`Cleaned ${filename}`);
}

for (const [file, dots] of Object.entries(GROMMETS)) {
  await cleanFile(file, dots);
}

console.log("Done.");