// One-off: regenerate the extension/favicon PNGs from the Pokéathlon Electrode-Mega sprite.
// Usage: node scripts/make-icons.mjs
import Jimp from 'jimp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const faviconsDir = join(__dirname, '..', 'src', 'assets', 'favicons');

const SOURCE = 'https://play.pokeathlon.com/sprites/fangame-sprites/pokeathlon/front/electrodemega.gif';
const SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024, 2048];

const run = async () => {
  console.log('fetching', SOURCE);
  const res = await fetch(SOURCE);

  if (!res.ok) {
    throw new Error(`failed to fetch source (${res.status})`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  // Jimp reads the first frame of an animated GIF
  const base = await Jimp.read(buf);

  console.log('source size', base.bitmap.width, 'x', base.bitmap.height);

  for (const size of SIZES) {
    // contain into a square transparent canvas so non-square frames stay centered & undistorted
    const img = base.clone().contain(size, size);
    const out = await img.getBufferAsync(Jimp.MIME_PNG);
    const dest = join(faviconsDir, `showdex-${size}.png`);

    await writeFile(dest, out);
    console.log('wrote', dest);
  }

  console.log('done');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
