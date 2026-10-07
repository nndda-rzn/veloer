// Favicon generator: crops the cyclist emblem out of the brand logo.
//
// The logo (public/logo.webp) is a vertical lockup: a cyclist emblem on top
// and the "VELOER" wordmark underneath. A favicon renders at 16-32px, where
// the wordmark is illegible, so we crop just the emblem and fit it to a square
// canvas (favicons render 1:1; a wide image would be squashed).
//
// Nothing is redrawn: this only crops and re-containers the existing artwork.
//
// Run manually when the logo changes:
//   node scripts/generate-favicon.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');

// Emblem bounds inside logo.webp (256x140), measured from the artwork:
// the wordmark starts at y=91, so the emblem is everything above it.
const EMBLEM = { left: 67, top: 25, width: 104, height: 66 };

// 64px covers a 32px browser tab at 2x DPI. A 256px icon would be ~76 KB for
// pixels no browser ever displays.
const SIZE = 64;

async function main() {
  const logo = await readFile(path.join(publicDir, 'logo.webp'));

  // fit: 'contain' pads to an exact SIZE x SIZE canvas with transparent
  // padding, which is what a favicon needs. Encoding through a PNG buffer
  // first keeps the crop dimensions unambiguous.
  const cropped = await sharp(logo).extract(EMBLEM).png().toBuffer();

  const buffer = await sharp(cropped)
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const out = path.join(publicDir, 'favicon.png');
  await writeFile(out, buffer);

  const meta = await sharp(buffer).metadata();
  console.log(
    `Cropped emblem ${EMBLEM.width}x${EMBLEM.height} from logo.webp -> ` +
      `${path.basename(out)} ${meta.width}x${meta.height} (${(buffer.length / 1024).toFixed(1)} KB)`,
  );
}

await main();
