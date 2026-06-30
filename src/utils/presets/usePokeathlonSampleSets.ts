import * as React from 'react';
import {
  type AbilityName,
  type ItemName,
  type MoveName,
} from '@smogon/calc';
import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { calcPresetCalcdexId } from '@showdex/utils/calc';
import { env, formatId } from '@showdex/utils/core';
import { detectGenFromFormat, getDexForFormat, getGenlessFormat } from '@showdex/utils/dex';
import MariomonSets from '@showdex/assets/presets/mariomon-sets.json';

/**
 * Shape of a bundled sample set (built by `scripts/build-mariomon-sets.mjs`).
 */
interface PokeathlonSampleSet {
  name: string;
  item: string | null;
  ability: string | null;
  nature: string | null;
  teraType: string | null;
  level: number | null;
  evs: Partial<Record<Showdown.StatName, number>>;
  ivs: Partial<Record<Showdown.StatName, number>>;
  moves: string[];
}

type PokeathlonSampleSetsData = Record<string, { name: string; sets: PokeathlonSampleSet[] }>;

/**
 * Bundled sample-set dumps keyed by the mod keyword they apply to.
 *
 * * These are full competitive sets (item/ability/nature/EVs/IVs/Tera/moves) hand-built by the
 *   Pokéathlon community & surfaced as named, selectable `'bundle'` presets.
 */
const PokeathlonSampleSetBundles: { match: RegExp; data: PokeathlonSampleSetsData }[] = [
  { match: /mariomon/i, data: MariomonSets as PokeathlonSampleSetsData },
];

const fullStats = (
  partial: Partial<Record<Showdown.StatName, number>>,
  fallback: number,
): Showdown.StatsTable => (['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as Showdown.StatName[])
  .reduce((prev, stat) => {
    prev[stat] = typeof partial?.[stat] === 'number' ? partial[stat] : fallback;
    return prev;
  }, {} as Showdown.StatsTable);

/**
 * Surfaces Pokéathlon's bundled community **sample sets** (currently Mariomon) as named
 * `CalcdexPokemonPreset`s for non-random Mariomon formats.
 *
 * * Each set keeps its role name (e.g. *Bulky DD*, *Offensive Lead*) so it's meaningful in the
 *   set dropdown, and carries the full spread/Tera/moves for accurate calcs.
 * * Resolved through the live client dex so Mariomon's custom species/moves/items/abilities match.
 *
 * @since 1.0.4
 */
export const usePokeathlonSampleSets = (
  format: string,
  config?: { disabled?: boolean },
): { loading: boolean; presets: CalcdexPokemonPreset[] } => {
  const { disabled } = config || {};

  const gen = detectGenFromFormat(format);
  const genlessFormat = getGenlessFormat(format);

  const presets = React.useMemo<CalcdexPokemonPreset[]>(() => {
    const formatKey = formatId(format);
    const bundle = (!disabled && !!gen && !formatKey.includes('random'))
      ? PokeathlonSampleSetBundles.find((b) => b.match.test(formatKey))?.data
      : null;

    if (!bundle) {
      return [];
    }

    const dex = getDexForFormat(format);

    if (!dex) {
      return [];
    }

    const defaultLevel = env.int('calcdex-pokemon-default-level', 100);
    const output: CalcdexPokemonPreset[] = [];

    Object.entries(bundle).forEach(([id, entry]) => {
      const species = dex.species.get(id);
      const speciesForme = (species?.exists && species.name) || entry?.name;

      if (!speciesForme || !entry?.sets?.length) {
        return;
      }

      entry.sets.forEach((set) => {
        const ability = set.ability ? (dex.abilities.get(set.ability)?.name || set.ability) : null;
        const item = set.item ? (dex.items.get(set.item)?.name || set.item) : null;
        const moves = (set.moves || []).map((m) => dex.moves.get(m)?.name || m).filter(Boolean);

        const preset: CalcdexPokemonPreset = {
          calcdexId: null,
          id: null,
          source: 'bundle',
          name: set.name || 'Sample',
          gen,
          format: genlessFormat,
          speciesForme,
          level: set.level || defaultLevel,
          nature: (set.nature as Showdown.PokemonNature) || 'Hardy',
          ivs: fullStats(set.ivs, 31),
          evs: fullStats(set.evs, 0),
          moves: moves as MoveName[],
        };

        if (ability) {
          preset.ability = ability as AbilityName;
        }

        if (item) {
          preset.item = item as ItemName;
        }

        if (set.teraType) {
          preset.teraTypes = [set.teraType as Showdown.TypeName];
        }

        preset.calcdexId = calcPresetCalcdexId(preset);
        preset.id = preset.calcdexId;

        output.push(preset);
      });
    });

    return output;
  }, [disabled, format, genlessFormat, gen]);

  return { loading: false, presets };
};
