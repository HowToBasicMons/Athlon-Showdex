// Fetches the Mariomon sample-team pokepastes & bundles them into a sets JSON consumed by
// usePokeathlonSampleSets(). Usage: node scripts/build-mariomon-sets.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outJson = join(__dirname, '..', 'src', 'assets', 'presets', 'mariomon-sets.json');

const PASTES = [
  '3489512c3daa30c1', 'b125b17edcbf1c6e', 'd87a8314ec42f95f',
  '6ab78b0aa08843ca', '3dd97027fd510588', '00bb529e287a41d2',
];

const STAT_KEYS = { hp: 'hp', atk: 'atk', def: 'def', spa: 'spa', spd: 'spd', spe: 'spe' };
const statKey = (label) => STAT_KEYS[String(label).toLowerCase()] || null;

const id = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const parseSpread = (str) => {
  const out = {};
  String(str).split('/').forEach((chunk) => {
    const m = chunk.trim().match(/^(\d+)\s+(\w+)/);
    if (!m) return;
    const k = statKey(m[2]);
    if (k) out[k] = Number.parseInt(m[1], 10);
  });
  return out;
};

const parseMon = (block) => {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  let first = lines[0];
  let item = null;
  const atIdx = first.lastIndexOf(' @ ');
  if (atIdx >= 0) { item = first.slice(atIdx + 3).trim(); first = first.slice(0, atIdx).trim(); }

  // strip trailing gender
  first = first.replace(/\s*\((?:M|F|N)\)\s*$/i, '').trim();

  // "Role (Species)" -> role + species; else species only
  let species = first;
  let role = null;
  const nm = first.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (nm) { role = nm[1].trim(); species = nm[2].trim(); }

  const set = {
    name: role || species,
    species,
    item: item || null,
    ability: null,
    nature: null,
    teraType: null,
    level: null,
    evs: {},
    ivs: {},
    moves: [],
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('- ')) { set.moves.push(line.slice(2).trim()); continue; }
    if (line.startsWith('Ability:')) { set.ability = line.slice(8).trim(); continue; }
    if (line.startsWith('Tera Type:')) { set.teraType = line.slice(10).trim(); continue; }
    if (line.startsWith('Level:')) { set.level = Number.parseInt(line.slice(6).trim(), 10) || null; continue; }
    if (line.startsWith('EVs:')) { set.evs = parseSpread(line.slice(4)); continue; }
    if (line.startsWith('IVs:')) { set.ivs = parseSpread(line.slice(4)); continue; }
    if (/\bNature$/.test(line)) { set.nature = line.replace(/\s*Nature$/, '').trim(); continue; }
  }

  if (!set.species || !set.moves.length) return null;
  return set;
};

const run = async () => {
  const out = {};
  let total = 0;

  for (const slug of PASTES) {
    const res = await fetch(`https://pokepast.es/${slug}/raw`);
    if (!res.ok) throw new Error(`fetch ${slug} failed (${res.status})`);
    const text = await res.text();

    text.split(/\n\s*\n/).forEach((block) => {
      const set = parseMon(block);
      if (!set) return;

      const key = id(set.species);
      if (!out[key]) out[key] = { name: set.species, sets: [], _sigs: new Set() };
      delete set.species;

      // QoL/perf: dedupe identical sets that recur across the sample teams
      const sig = [
        id(set.item), id(set.ability), id(set.nature), id(set.teraType),
        JSON.stringify(set.evs), JSON.stringify(set.ivs),
        set.moves.map(id).sort().join(','),
      ].join('|');

      if (out[key]._sigs.has(sig)) return;
      out[key]._sigs.add(sig);

      out[key].sets.push(set);
      total += 1;
    });
  }

  // strip the internal dedupe helper before writing
  Object.values(out).forEach((entry) => { delete entry._sigs; });

  await mkdir(dirname(outJson), { recursive: true });
  await writeFile(outJson, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`parsed ${Object.keys(out).length} species, ${total} sets -> ${outJson}`);
};

run().catch((err) => { console.error(err); process.exit(1); });
