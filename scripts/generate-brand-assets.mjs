/**
 * Resize brand masters into public/brand/ for header, favicon, OG.
 *
 * Input priority per asset:
 *  1. public/brand/masters/*-master.jpg (clean regenerated masters)
 *  2. Desktop/assets/{Icon,Banner}-{Dark,Light}.png (LEDGERFUL_BRAND_SRC)
 *
 * Banners: solid plate backgrounds are chroma-keyed to true alpha so the
 * wordmark sits on the page canvas (no dark/light rectangle behind the logo).
 *
 * Usage: node scripts/generate-brand-assets.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "brand");
const mastersDir = path.join(outDir, "masters");
const desktopDir =
  process.env.LEDGERFUL_BRAND_SRC ||
  path.join(process.env.USERPROFILE || "", "Desktop", "assets");

const ICON_SIZES = [32, 64, 180, 512];
const BANNER_WIDTH = 960;

function resolveSource(candidates) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Missing brand master. Tried:\n  ${candidates.join("\n  ")}`);
}

/**
 * Make near-uniform plate background transparent by sampling corner color.
 * Soft edge avoids a harsh halo on anti-aliased logo edges.
 */
async function keyBackgroundTransparent(pngPath, { threshold = 30, soft = 18 } = {}) {
  const { data, info } = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const sample = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const corners = [
    sample(0, 0),
    sample(width - 1, 0),
    sample(0, height - 1),
    sample(width - 1, height - 1),
    sample(2, 2),
    sample(width - 3, 2),
    sample(2, height - 3),
    sample(width - 3, height - 3),
  ];
  const bg = corners
    .reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0])
    .map((v) => Math.round(v / corners.length));

  const out = Buffer.from(data);
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const dist = Math.hypot(out[o] - bg[0], out[o + 1] - bg[1], out[o + 2] - bg[2]);
    if (dist <= threshold) {
      out[o + 3] = 0;
    } else if (dist < threshold + soft) {
      out[o + 3] = Math.round(255 * ((dist - threshold) / soft));
    }
  }

  await sharp(out, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);

  return bg;
}

async function resizeIcon(stem, sources) {
  const input = resolveSource(sources);
  for (const size of ICON_SIZES) {
    const dest = path.join(outDir, `${stem}-${size}.png`);
    await sharp(input)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(path.relative(root, dest), fs.statSync(dest).size);
  }
}

async function resizeBanner(stem, sources, keyOpts) {
  const input = resolveSource(sources);
  const destPng = path.join(outDir, `${stem}-${BANNER_WIDTH}.png`);
  const destWebp = path.join(outDir, `${stem}-${BANNER_WIDTH}.webp`);

  await sharp(input)
    .resize(BANNER_WIDTH, null, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toFile(destPng);

  const bg = await keyBackgroundTransparent(destPng, keyOpts);
  console.log(path.relative(root, destPng), "keyed bg", bg.join(","));

  await sharp(destPng)
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(destWebp);

  console.log(path.relative(root, destPng), fs.statSync(destPng).size);
  console.log(path.relative(root, destWebp), fs.statSync(destWebp).size);
}

fs.mkdirSync(outDir, { recursive: true });
for (const bad of fs.readdirSync(outDir)) {
  if (bad.includes("+stem") || bad.includes("'")) {
    fs.unlinkSync(path.join(outDir, bad));
  }
}

await resizeIcon("icon-dark", [
  path.join(mastersDir, "icon-dark-master.jpg"),
  path.join(desktopDir, "Icon-Dark.png"),
]);
await resizeIcon("icon-light", [
  path.join(mastersDir, "icon-light-master.jpg"),
  path.join(desktopDir, "Icon-Light.png"),
]);
await resizeBanner(
  "banner-dark",
  [
    path.join(mastersDir, "banner-dark-master.jpg"),
    path.join(desktopDir, "Banner-Dark.png"),
    path.join(outDir, "banner-dark-960.png"),
  ],
  { threshold: 32, soft: 20 },
);
await resizeBanner(
  "banner-light",
  [
    path.join(mastersDir, "banner-light-master.jpg"),
    path.join(desktopDir, "Banner-Light.png"),
    path.join(outDir, "banner-light-960.png"),
  ],
  { threshold: 28, soft: 18 },
);

// Convenient aliases for favicon / apple-touch (dark default)
fs.copyFileSync(
  path.join(outDir, "icon-dark-32.png"),
  path.join(outDir, "favicon-32.png"),
);
fs.copyFileSync(
  path.join(outDir, "icon-dark-180.png"),
  path.join(outDir, "apple-touch-icon.png"),
);
fs.copyFileSync(
  path.join(outDir, "icon-dark-32.png"),
  path.join(outDir, "favicon-32-dark.png"),
);
fs.copyFileSync(
  path.join(outDir, "icon-light-32.png"),
  path.join(outDir, "favicon-32-light.png"),
);

console.log("Brand assets written to public/brand/ (banners have transparent backgrounds)");
