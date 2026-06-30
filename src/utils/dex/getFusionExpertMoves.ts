import { type MoveName } from '@smogon/calc';
import { formatId } from '@showdex/utils/core';
import { getDexForFormat } from './getDexForFormat';
import { getPokemonLearnset } from './getPokemonLearnset';

/**
 * A single Expert Move criterion. A fusion qualifies for the move if it satisfies **all** present
 * conditions of **any one** of the move's criteria objects.
 *
 * - `fusion`: the Head or Body species id must be in this list.
 * - `type`: the fused typing must include **all** of these types.
 * - `learns`: the Head or Body must be able to learn **any** of these moves.
 */
type ExpertMoveCriterion = { fusion?: string[]; type?: string[]; learns?: string[] };

/**
 * Pokéathlon "Expert Moves" — signature moves taught to fusions that meet certain criteria.
 *
 * * Ported verbatim from the live client's `fusionMoves` table (`battle-dex-search.ts`).
 *
 * @since 1.0.5
 */
const FusionMoves: Record<string, ExpertMoveCriterion[]> = {
  attackorder: [{ fusion: ['beedrill'] }],
  pollenpuff: [{ fusion: ['butterfree', 'celebi', 'parasect', 'vileplume', 'breloom'] }],
  lunge: [{ fusion: ['spinarak', 'ariados', 'joltik', 'galvantula', 'venomoth', 'volcarona', 'pinsir', 'parasect', 'ledian', 'doduo', 'dodrio', 'stantler'] }],
  defendorder: [{ fusion: ['beedrill'] }],
  healorder: [{ fusion: ['beedrill'] }],
  powder: [{ fusion: ['butterfree', 'venomoth', 'volcarona', 'parasect', 'breloom'] }],
  tailglow: [{ fusion: ['mareep', 'flaaffy', 'ampharos', 'lanturn', 'zekrom', 'reshiram'] }],
  darkestlariat: [{ fusion: ['snorlax', 'regigigas', 'poliwrath', 'machamp', 'electivire', 'dusknoir', 'swampert', 'krookodile', 'golurk'] }],
  partingshot: [{ fusion: ['meowth', 'persian', 'sandile', 'krokorok', 'krookodile', 'umbreon'] }],
  topsyturvy: [{ fusion: ['hitmontop', 'wobbuffet'] }],
  zingzap: [{ fusion: ['pichu', 'pikachu', 'raichu', 'voltorb', 'electrode'] }, { fusion: ['sandslash', 'golem'], type: ['Electric'] }],
  paraboliccharge: [{ fusion: ['pichu', 'pikachu', 'raichu', 'magnemite', 'magneton', 'magnezone', 'mareep', 'flaaffy', 'ampharos', 'elekid', 'electabuzz', 'electivire', 'zapdos', 'chinchou', 'lanturn', 'raikou', 'klink', 'klang', 'klinklang', 'rotom', 'stunfisk'] }],
  electrify: [{ fusion: ['klink', 'klang', 'klinklang'] }, { type: ['Electric'] }],
  aromaticmist: [{ fusion: ['weezing', 'bulbasaur', 'ivysaur', 'venusaur', 'chikorita', 'bayleef', 'meganium', 'gloom', 'vileplume', 'bellossom', 'roselia', 'roserade'] }],
  floralhealing: [{ fusion: ['sunflora', 'bellossom', 'roselia', 'roserade'] }],
  secretsword: [{ fusion: ['honedge', 'doublade', 'aegislash', 'gallade', 'farfetchd', 'absol', 'bisharp', 'kingambit'] }],
  matblock: [{ fusion: ['machop', 'machoke', 'machamp', 'tyrogue', 'hitmonlee', 'hitmonchan', 'hitmontop'] }],
  mindblown: [{ fusion: ['voltorb', 'electrode', 'exeggutor'] }],
  shelltrap: [{ fusion: ['magcargo', 'forretress'] }],
  heatcrash: [{ fusion: ['blaziken', 'reshiram', 'groudon', 'charizard', 'golurk', 'regigigas', 'rhydon', 'rhyperior', 'snorlax'] }],
  shadowbone: [{ fusion: ['marowak'], type: ['Ghost'] }],
  spiritshackle: [{ fusion: ['banette', 'spiritomb', 'dusknoir', 'shedinja', 'cofagrigus'] }],
  trickortreat: [{ fusion: ['gastly', 'haunter', 'gengar', 'mimikyu', 'zorua', 'zoroark'] }, { type: ['Grass', 'Ghost'] }],
  tropkick: [{ fusion: ['hitmonlee', 'hitmontop', 'roserade'] }, { type: ['Grass', 'Fighting'] }],
  strengthsap: [{ fusion: ['oddish', 'gloom', 'vileplume', 'bellossom', 'hoppip', 'skiploom', 'jumpluff', 'bellsprout', 'weepinbell', 'victreebel', 'paras', 'parasect', 'drifblim', 'breloom'] }],
  icehammer: [{ type: ['Ice'], learns: ['crabhammer', 'woodhammer'] }],
  multiattack: [{ fusion: ['arceus', 'mew', 'genesect'] }],
  instruct: [{ fusion: ['chimchar', 'monferno', 'infernape', 'kadabra', 'alakazam', 'slowking'] }],
  psychicterrain: [{ type: ['Psychic'] }],
  mistyterrain: [{ type: ['Fairy'] }],
  speedswap: [{ fusion: ['pikachu', 'raichu', 'abra', 'kadabra', 'alakazam', 'porygon', 'porygon2', 'porygonz', 'mewtwo', 'mew', 'joltik', 'galvantula'] }],
  sparklingaria: [{ fusion: ['jynx', 'jigglypuff', 'wigglytuff'], type: ['Water'] }, { fusion: ['lapras'] }],
  hyperspacefury: [{ fusion: ['giratina', 'palkia', 'dialga', 'arceus'] }],
  coreenforcer: [{ fusion: ['giratina', 'palkia', 'dialga', 'rayquaza'] }],
  plasmafists: [{ fusion: ['electabuzz', 'electivire', 'zekrom'] }, { fusion: ['rotom'], learns: ['thunderpunch'] }],
  lightofruin: [{ fusion: ['arceus', 'mew', 'celebi', 'jirachi'] }],
  fleurcannon: [{ fusion: ['gardevoir', 'gallade', 'sylveon', 'wigglytuff'] }],
  naturesmadness: [{ fusion: ['celebi', 'kyogre', 'groudon', 'absol'] }],
  geomancy: [{ fusion: ['celebi'] }],
  vcreate: [{ fusion: ['entei', 'hooh', 'typhlosion'] }],
  magmastorm: [{ fusion: ['magcargo', 'typhlosion', 'magmortar', 'magmar', 'entei', 'groudon'] }, { learns: ['eruption'] }],
  searingshot: [{ fusion: ['magmortar'] }],
  oblivionwing: [{ fusion: ['murkrow', 'honchkrow'] }, { type: ['Dark', 'Flying'] }],
  moongeistbeam: [{ fusion: ['cleffa', 'clefairy', 'clefable'], type: ['Dark'] }, { fusion: ['darkrai', 'misdreavus', 'mismagius'] }],
  spectralthief: [{ fusion: ['haunter', 'gengar', 'banette', 'giratina', 'honedge', 'doublade', 'aegislash'] }],
  seedflare: [{ fusion: ['jumpluff', 'sunflora'] }],
  landswrath: [{ fusion: ['groudon'] }],
  thousandarrows: [{ fusion: ['sandslash', 'jolteon', 'ferrothorn'], type: ['Ground'] }],
  thousandwaves: [{ fusion: ['stunfisk', 'quagsire', 'swampert'] }],
  freezeshock: [{ fusion: ['kyurem', 'articuno'], type: ['Electric'] }],
  iceburn: [{ fusion: ['kyurem', 'articuno'], type: ['Fire'] }],
  happyhour: [{ fusion: ['meowth', 'jirachi', 'delibird', 'munchlax', 'snorlax', 'pikachu', 'raichu'] }],
  holdhands: [{ fusion: ['charmander', 'bulbasaur', 'squirtle', 'pikachu', 'togepi'] }],
  sunsteelstrike: [{ fusion: ['charizard', 'volcarona', 'flareon', 'ninetales', 'entei', 'hooh', 'rapidash'], type: ['Steel'] }],
  doubleironbash: [{ type: ['Steel'], learns: ['doubleslap'] }],
  steameruption: [{ type: ['Water'], learns: ['eruption'] }],
};

/**
 * Pokéathlon / Chaos-specific Expert Moves (merged over `FusionMoves` for those mods).
 *
 * * Ported verbatim from the client's `PoAfusionMoves` table.
 *
 * @since 1.0.5
 */
const PoAFusionMoves: Record<string, ExpertMoveCriterion[]> = {
  zapcannon: [{ fusion: ['silretro'], learns: ['inferno'] }],
  retroblast: [{ learns: ['thunderbolt'], type: ['Rock'] }],
  superheatedcrash: [{ learns: ['flareblitz', 'heatcrash'], type: ['Water'] }],
  stoneaxe: [{ fusion: ['kleavordelta'], type: ['Rock'] }],
  floatyfall: [{ fusion: ['tofagrif'], learns: ['gravity'] }],
  thunderouskick: [{ fusion: ['sekrilon'], learns: ['thunder'] }],
  heatcrash: [{ fusion: ['omecha'], type: ['Fire'] }],
  syrupbomb: [{ fusion: ['mochimechi'], type: ['Grass'] }],
  shadowpunch: [{ fusion: ['hoppyre'], type: ['Fighting'] }],
  saltcure: [{ fusion: ['mosster'], learns: ['smellingsalts'] }],
  pyropounce: [{ learns: ['bounce'], type: ['Fire'] }],
  riftjump: [{ learns: ['bounce'], type: ['Electric'] }],
  purify: [{ fusion: ['pestri'] }],
  mistyexplosion: [{ fusion: ['furumo'] }],
  heatwave: [{ fusion: ['snowiibay'] }],
  mindwipe: [{ learns: ['haze'], type: ['Psychic'] }],
  surgingstrikes: [{ fusion: ['crayzigater'] }],
  infernalparade: [{ fusion: ['calobera'], type: ['Fire'] }],
  accelerock: [{ fusion: ['crenibex'] }],
  chillyreception: [{ fusion: ['heracrosssubarctic'], learns: ['yawn'] }],
  luminacrash: [{ fusion: ['anneliark'] }],
  esperwing: [{ fusion: ['twinova'] }],
  pollenpuff: [{ fusion: ['butterfree', 'celebi', 'parasect', 'parashukado', 'vileplume', 'breloom'] }],
  lunge: [{ fusion: ['spinarak', 'ariados', 'joltik', 'galvantula', 'venomoth', 'volcarona', 'pinsir', 'parasect', 'parashukado', 'ledian', 'doduo', 'dodrio', 'stantler'] }],
  powder: [{ fusion: ['butterfree', 'venomoth', 'volcarona', 'parasect', 'parashukado', 'breloom'] }],
  strengthsap: [{ fusion: ['sweepdol', 'oddish', 'gloom', 'vileplume', 'bellossom', 'hoppip', 'skiploom', 'jumpluff', 'bellsprout', 'weepinbell', 'victreebel', 'paras', 'parasect', 'parashukado', 'drifblim', 'breloom'] }],
  ruination: [{ fusion: ['catastropede'] }],
  clangoroussoul: [{ fusion: ['hydroupa'] }],
  earthpower: [{ fusion: ['magnegauss'] }],
  spudmortar: [{ learns: ['energyball'], type: ['Electric', 'Ground'] }],
  phantasmalgust: [{ learns: ['hurricane'], type: ['Ghost'] }],
  venomousroar: [{ learns: ['roar'], type: ['Poison'] }],
  severingwind: [{ learns: ['slash'], type: ['Flying'] }],
  healorder: [{ fusion: ['nestitan', 'beedrill'], type: ['Bug'] }],
  topsyturvy: [{ fusion: ['pandiz', 'hitmontop', 'wobbuffet'] }],
  pixietrick: [{ type: ['Dark', 'Fairy'] }],
  magmastorm: [{ fusion: ['saturoceras', 'magcargo', 'typhlosion', 'magmortar', 'magmar', 'entei', 'groudon'] }, { learns: ['eruption'] }],
  pheroblast: [{ type: ['Bug'] }],
  meltdown: [{ learns: ['explosion', 'selfdestruct'], type: ['Fire'] }],
  throwingknives: [{ learns: ['rockblast', 'bulletseed'], type: ['Steel'] }],
  shockbombs: [{ learns: ['rockblast', 'bulletseed'], type: ['Electric'] }],
  boulderbash: [{ learns: ['doublehit'], type: ['Rock'] }],
  heavycleave: [{ learns: ['cut'], type: ['Steel'] }],
  cometstrike: [{ type: ['Rock'] }],
  spiritsiphon: [{ learns: ['gigadrain', 'drainingkiss'], type: ['Ghost'] }],
  ceaselessedge: [{ fusion: ['cloudinyte'] }],
  skypierce: [{ learns: ['sacredsword'], type: ['Flying'] }],
  wringout: [{ fusion: ['sauphozoa'], learns: ['coil'] }],
};

/**
 * Computes the **Expert Moves** a fusion qualifies for (Head + Body + fused typing), mirroring the
 * live client's tutor-move logic.
 *
 * * `fusedTypes` should be the fusion's resolved typing (proper-cased `TypeName`s).
 * * Returns resolved move **names** (deduped), ready to merge into the move pool.
 * * Uses a simplified Head/Body match (not the client's full evolution-line expansion), which
 *   covers the overwhelming majority of pairs.
 *
 * @since 1.0.5
 */
export const getFusionExpertMoves = (
  format: string,
  headForme: string,
  bodyForme: string,
  fusedTypes: readonly string[],
): MoveName[] => {
  if (!format || !headForme || !bodyForme) {
    return [];
  }

  const dex = getDexForFormat(format);

  if (!dex) {
    return [];
  }

  const headId = formatId(headForme);
  const bodyId = formatId(bodyForme);
  const typeSet = new Set((fusedTypes || []).map((t) => String(t)));

  const usePoA = /pokeathlon|chaos/.test(formatId(format));
  const tables = usePoA ? { ...FusionMoves, ...PoAFusionMoves } : FusionMoves;

  // pre-compute learnsets once for the `learns` checks
  const headLearnset = new Set(getPokemonLearnset(format, headForme, true).map((m) => formatId(m)));
  const bodyLearnset = new Set(getPokemonLearnset(format, bodyForme, true).map((m) => formatId(m)));
  const canLearn = (moveId: string) => headLearnset.has(moveId) || bodyLearnset.has(moveId);

  const output: MoveName[] = [];

  Object.entries(tables).forEach(([moveId, criteria]) => {
    const qualifies = criteria.some((src) => {
      if (src.fusion?.length && !src.fusion.includes(headId) && !src.fusion.includes(bodyId)) {
        return false;
      }

      if (src.type?.length && !src.type.every((t) => typeSet.has(t))) {
        return false;
      }

      if (src.learns?.length && !src.learns.some((m) => canLearn(formatId(m)))) {
        return false;
      }

      return true;
    });

    if (!qualifies) {
      return;
    }

    const name = dex.moves.get(moveId)?.name as MoveName;

    if (name && !output.includes(name)) {
      output.push(name);
    }
  });

  return output;
};
