import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const iconSvg = readFileSync(join(root, "public/brand/revel-icon.svg"));

const outputs = [
  { file: "public/favicon-16x16.png", size: 16 },
  { file: "public/favicon-32x32.png", size: 32 },
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "public/android-chrome-192x192.png", size: 192 },
  { file: "public/android-chrome-512x512.png", size: 512 },
  { file: "public/icon.png", size: 32 },
];

for (const { file, size } of outputs) {
  const png = await sharp(iconSvg)
    .resize(size, size, { fit: "contain", background: "#F7F2EB" })
    .png()
    .toBuffer();

  await sharp(png).toFile(join(root, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

const favicon32 = await sharp(iconSvg)
  .resize(32, 32, { fit: "contain", background: "#F7F2EB" })
  .png()
  .toFile(join(root, "public/favicon.ico"));

console.log("wrote public/favicon.ico");
void favicon32;

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
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
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