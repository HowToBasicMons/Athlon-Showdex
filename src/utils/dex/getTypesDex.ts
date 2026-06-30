import { type GenerationNum } from '@smogon/calc';
import { Types } from '@smogon/calc/dist/data/types';
import { formatId } from '@showdex/utils/core';

/**
 * Maps Showdown's `damageTaken` codes to damage multipliers.
 *
 * * `0` → neutral (×1), `1` → super effective (×2), `2` → resisted (×0.5), `3` → immune (×0).
 */
const DamageTakenToMultiplier: Record<number, number> = {
  0: 1,
  1: 2,
  2: 0.5,
  3: 0,
};

/**
 * Per-gen cache of the built `Types` resolver, plus the `BattleTypeChart` reference it was built
 * from. Rebuilding the resolver iterates the entire chart, & `getTypesDex()` is called for every
 * matchup — so we cache it & only rebuild when the chart object itself changes (e.g. a mod swap).
 */
let cachedChart: object | null = null;
const cachedTypesDex: Partial<Record<GenerationNum, Types>> = {};

/**
 * Returns the `types` property used in the `Generation` class.
 *
 * * Note that the object returned by `Dex.types.get()` (from the global `Dex` object) does not
 *   include properties like `effectiveness` that is provided by the `get()` method of the `Types` class.
 * * Pokéathlon adaptation: when the live client's `BattleTypeChart` is available, the type
 *   effectiveness is derived from it instead of `@smogon/calc`'s static 18-type chart. This adds
 *   support for the server's **custom types** (Cosmic, Nuclear, Crystal, Sound, Light, ...) & picks
 *   up any server-side tweaks to the standard type matchups, keeping damage calcs accurate.
 *   - Falls back to the stock `Types` class if the client chart isn't available.
 *
 * @since 1.0.3
 */
export const getTypesDex = (gen: GenerationNum): Types => {
  const chart = (typeof window !== 'undefined'
    && (window as unknown as { BattleTypeChart?: Record<string, { damageTaken?: Record<string, number> }> })?.BattleTypeChart)
    || null;

  if (!chart || typeof chart !== 'object') {
    return new Types(gen);
  }

  // invalidate the cache if the chart object changed (e.g. switched into a different mod's battle)
  if (chart !== cachedChart) {
    cachedChart = chart;
    (Object.keys(cachedTypesDex) as unknown as GenerationNum[]).forEach((g) => delete cachedTypesDex[g]);
  }

  if (cachedTypesDex[gen]) {
    return cachedTypesDex[gen];
  }

  const fallback = new Types(gen);

  // chart keys are lowercase type ids; damageTaken keys are Proper-cased type names
  // (build a id -> Proper Name lookup from every damageTaken object)
  const properNames: Record<string, string> = {};

  Object.keys(chart).forEach((id) => {
    const damageTaken = chart[id]?.damageTaken;

    if (!damageTaken) {
      return;
    }

    Object.keys(damageTaken).forEach((attackerName) => {
      properNames[formatId(attackerName)] = attackerName;
    });
  });

  const properName = (id: string) => properNames[id]
    || `${id.charAt(0).toUpperCase()}${id.slice(1)}`;

  const buildEffectiveness = (attackerName: string) => Object.keys(chart).reduce((eff, defId) => {
    const damageTaken = chart[defId]?.damageTaken;

    if (damageTaken && attackerName in damageTaken) {
      eff[properName(defId)] = DamageTakenToMultiplier[damageTaken[attackerName]] ?? 1;
    }

    return eff;
  }, {} as Record<string, number>);

  const cache: Record<string, unknown> = {};

  const get = (id: string) => {
    const key = formatId(id);

    // '???' & unknown ids -> defer to the stock chart
    if (!key || !(key in chart)) {
      return fallback.get(id as never);
    }

    if (!cache[key]) {
      const name = properName(key);

      cache[key] = {
        kind: 'Type',
        id: key,
        name,
        effectiveness: buildEffectiveness(name),
      };
    }

    return cache[key];
  };

  const result = {
    get,
    * [Symbol.iterator]() {
      // eslint-disable-next-line no-restricted-syntax
      for (const id of Object.keys(chart)) {
        yield get(id);
      }
    },
  } as unknown as Types;

  cachedTypesDex[gen] = result;

  return result;
};
