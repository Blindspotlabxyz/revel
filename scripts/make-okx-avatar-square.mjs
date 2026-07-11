import sharp from "sharp";
import { writeFileSync } from "fs";
import path from "path";

/**
 * OKX ASP avatar requirements:
 * - exactly 440×440
 * - hard square corners (no rounded icon shape in the artwork)
 * - sharp, polished software/service style
 * - aligned with Revel: website growth audit / reveal blindspots
 */
const size = 440;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Full-bleed square canvas — corners must be opaque square pixels -->
  <rect width="${size}" height="${size}" fill="#111111"/>

  <!-- Subtle product grid (map / audit surface) -->
  <g stroke="#2A2A2A" stroke-width="2">
    ${[88, 176, 264, 352]
      .map(
        (v) =>
          `<line x1="0" y1="${v}" x2="${size}" y2="${v}"/><line x1="${v}" y1="0" x2="${v}" y2="${size}"/>`
      )
      .join("")}
  </g>

  <!-- Cream analysis panel (hard square, inset) -->
  <rect x="48" y="48" width="344" height="344" fill="#F7F2EB"/>

  <!-- Panel grid -->
  <g stroke="#E5D9CC" stroke-width="1.5">
    ${[134, 220, 306]
      .map(
        (v) =>
          `<line x1="48" y1="${v}" x2="392" y2="${v}"/><line x1="${v}" y1="48" x2="${v}" y2="392"/>`
      )
      .join("")}
  </g>

  <!-- Radar / focus rings = product insight -->
  <circle cx="220" cy="220" r="92" fill="none" stroke="#E07A5F" stroke-width="3" opacity="0.35"/>
  <circle cx="220" cy="220" r="58" fill="none" stroke="#E07A5F" stroke-width="5"/>
  <circle cx="220" cy="220" r="18" fill="#E07A5F"/>

  <!-- Crosshair -->
  <line x1="220" y1="110" x2="220" y2="330" stroke="#111111" stroke-width="2" opacity="0.2"/>
  <line x1="110" y1="220" x2="330" y2="220" stroke="#111111" stroke-width="2" opacity="0.2"/>

  <!-- Blindspot nodes on the map -->
  <rect x="118" y="148" width="36" height="24" fill="none" stroke="#E07A5F" stroke-width="3"/>
  <polygon points="292,150 312,170 292,190 272,170" fill="none" stroke="#E07A5F" stroke-width="3"/>
  <polygon points="150,268 168,248 186,268 168,288" fill="none" stroke="#C96A52" stroke-width="3"/>
  <circle cx="300" cy="290" r="8" fill="#111111"/>

  <!-- Paper peel reveal (hard geometric, square outer edge) -->
  <path d="M280 48 H392 V160 Z" fill="#F7F2EB"/>
  <path d="M280 48 L392 160 L392 48 Z" fill="#E07A5F"/>
  <path d="M280 48 L392 160" stroke="#C96A52" stroke-width="5" stroke-linecap="square"/>

  <!-- Small accent bar (software product chrome) -->
  <rect x="48" y="392" width="120" height="8" fill="#E07A5F"/>
</svg>`;

const outPng = path.resolve("public/brand/revel-avatar-440.png");
const outJpg = path.resolve("public/brand/revel-avatar-440-okx.jpg");

const pngInfo = await sharp(Buffer.from(svg))
  .resize(size, size, { fit: "fill" })
  .flatten({ background: { r: 17, g: 17, b: 17 } })
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(outPng);

// Also JPEG — some marketplaces prefer JPEG without alpha edge cases
const jpgInfo = await sharp(outPng)
  .jpeg({ quality: 95, mozjpeg: true })
  .toFile(outJpg);

const meta = await sharp(outPng).metadata();
const { data, info } = await sharp(outPng).raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => {
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
};

// Corner pixels must be opaque solid (not transparent / soft anti-aliased white fade)
const corners = {
  tl: px(0, 0),
  tr: px(size - 1, 0),
  bl: px(0, size - 1),
  br: px(size - 1, size - 1),
};

writeFileSync(
  path.resolve("public/brand/revel-avatar-okx.svg"),
  svg.replace(`width="${size}" height="${size}"`, 'width="440" height="440"')
);

console.log(
  JSON.stringify(
    {
      outPng,
      outJpg,
      pngInfo,
      jpgInfo,
      meta: { width: meta.width, height: meta.height, hasAlpha: meta.hasAlpha },
      corners,
      squareCorners: Object.values(corners).every(
        ([r, g, b]) => r === 17 && g === 17 && b === 17
      ),
    },
    null,
    2
  )
);
