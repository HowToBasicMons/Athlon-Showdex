// Parses scripts/mariomon-randbats.raw.csv into a bundled preset JSON consumed by
// usePokeathlonRandomsPresets(). Usage: node scripts/build-mariomon-randbats.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcCsv = join(__dirname, 'mariomon-randbats.raw.csv');
const outJson = join(__dirname, '..', 'src', 'assets', 'presets', 'mariomon-randbats.json');

const run = async () => {
  const raw = await readFile(srcCsv, 'utf8');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // drop header row
  const header = lines.shift();
  if (!/capture/i.test(header)) {
    throw new Error(`unexpected header: ${header}`);
  }

  /** @type {Record<string, { name: string; level: number; sets: { item: string|null; ability: string|null; moves: string[] }[] }>} */
  const out = {};
  let setCount = 0;

  for (const line of lines) {
    const f = line.split(',').map((s) => s.trim());

    if (f.length < 12) {
      throw new Error(`row has ${f.length} cols (expected 12): ${line}`);
    }

    const [name, id, , , item, ability, , m1, m2, m3, m4, levelRaw] = f;
    const level = Number.parseInt(levelRaw, 10);

    if (!name || !id || !Number.isFinite(level)) {
      throw new Error(`bad row: ${line}`);
    }

    const moves = [m1, m2, m3, m4].filter(Boolean);

    if (!out[id]) {
      out[id] = { name, level, sets: [] };
    }

    out[id].sets.push({
      item: item || null,
      ability: ability || null,
      moves,
    });
    setCount += 1;
  }

  await mkdir(dirname(outJson), { recursive: true });
  await writeFile(outJson, `${JSON.stringify(out, null, 2)}\n`);

  const species = Object.keys(out).length;
  console.log(`parsed ${species} species, ${setCount} sets -> ${outJson}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
