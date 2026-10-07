// One-off static image optimiser.
//
// The app ships a few decorative images from client/public. The originals were
// exported at print resolution (road-bike.png alone was 2.6 MB for a slot that
// renders at 420px wide), which dominated first paint on the login screen.
//
// Run manually when assets change:
//   node scripts/optimize-images.mjs
//
// It is deliberately NOT part of the Vite build: these images almost never
// change, and adding a native image pipeline to the Vite 8 / Rolldown build
// would add risk for no ongoing benefit.
import { readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');

/** width is the max rendered width times a 2x buffer for retina screens. */
const TARGETS = [
  { file: 'road-bike.png', width: 1000, quality: 80 },
  { file: 'mountain-bike.png', width: 1000, quality: 80 },
  { file: 'logo.png', width: 256, quality: 85 },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function optimize({ file, width, quality }) {
  const input = path.join(publicDir, file);
  const output = path.join(publicDir, file.replace(/\.png$/, '.webp'));

  const before = (await stat(input)).size;
  const source = await readFile(input);

  const info = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(output);

  const after = (await stat(output)).size;
  const saved = Math.round((1 - after / before) * 100);

  await unlink(input);

  console.log(
    `${file.padEnd(20)} ${kb(before).padStart(10)} → ${path.basename(output).padEnd(20)} ` +
      `${kb(after).padStart(9)}  ${info.width}x${info.height}  (-${saved}%)`,
  );

  return { before, after };
}

const results = [];
for (const target of TARGETS) {
  results.push(await optimize(target));
}

const totalBefore = results.reduce((sum, r) => sum + r.before, 0);
const totalAfter = results.reduce((sum, r) => sum + r.after, 0);

console.log(
  `\nTotal: ${kb(totalBefore)} → ${kb(totalAfter)} ` +
    `(-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`,
);
