import * as React from 'react';
import { type AbilityName, type ItemName, type MoveName } from '@smogon/calc';
import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { calcPresetCalcdexId } from '@showdex/utils/calc';
import { formatId } from '@showdex/utils/core';
import { detectGenFromFormat, getDexForFormat, getGenlessFormat } from '@showdex/utils/dex';
import MariomonRandbats from '@showdex/assets/presets/mariomon-randbats.json';

/**
 * Shape of the bundled Pokéathlon randbats dump (built by `scripts/build-mariomon-randbats.mjs`).
 *
 * * Keyed by species id; each entry has a per-species `level` & a list of discrete random sets.
 */
type PokeathlonRandbatsData = Record<string, {
  name: string;
  level: number;
  sets: {
    item: string | null;
    ability: string | null;
    moves: string[];
  }[];
}>;

/**
 * Bundled randbats dumps keyed by the genless format id they apply to.
 *
 * * Pokéathlon's fangame randbats sets don't exist in the pkmn/Smogon randbats data, so we bundle
 *   them with the build & surface them as `'bundle'`-source presets.
 */
const PokeathlonRandbatsBundles: Record<string, PokeathlonRandbatsData> = {
  mariomonrandombattle: MariomonRandbats as PokeathlonRandbatsData,
};

/** Resolves the bundled randbats dump for a format, if any. */
const resolveRandbatsBundle = (format: string): PokeathlonRandbatsData => {
  if (!format) {
    return null;
  }

  const key = formatId(format).replace(/^gen\d+/, '');

  return PokeathlonRandbatsBundles[key] || null;
};

/**
 * Surfaces Pokéathlon's bundled fangame randbats sets (currently Mariomon Random Battle) as
 * `CalcdexPokemonPreset`s, so the Calcdex can predict an opponent's possible item / ability /
 * moves / level — just like it does for standard Random Battles via the pkmn randbats data.
 *
 * * Each discrete set becomes its own preset (source `'bundle'`), so they show up as selectable
 *   options in the set dropdown.
 * * Names/abilities/items/moves are resolved through the live client dex so they match what
 *   `@smogon/calc` & the rest of Showdex expect (covers Mariomon's custom content).
 *
 * @since 1.3.0
 */
export const usePokeathlonRandomsPresets = (
  format: string,
  config?: { disabled?: boolean },
): { loading: boolean; presets: CalcdexPokemonPreset[] } => {
  const { disabled } = config || {};

  const gen = detectGenFromFormat(format);
  const genlessFormat = getGenlessFormat(format);

  const presets = React.useMemo<CalcdexPokemonPreset[]>(() => {
    const bundle = resolveRandbatsBundle(format);

    if (disabled || !gen || !bundle) {
      return [];
    }

    const dex = getDexForFormat(format);

    if (!dex) {
      return [];
    }

    const output: CalcdexPokemonPreset[] = [];

    Object.entries(bundle).forEach(([id, entry]) => {
      const species = dex.species.get(id);
      const speciesForme = (species?.exists && species.name) || entry?.name;

      if (!speciesForme || !entry?.sets?.length) {
        return;
      }

      entry.sets.forEach((set) => {
        const ability = set.ability
          ? (dex.abilities.get(set.ability)?.name || set.ability)
          : null;
        const item = set.item
          ? (dex.items.get(set.item)?.name || set.item)
          : null;
        const moves = (set.moves || [])
          .map((m) => dex.moves.get(m)?.name || m)
          .filter(Boolean);

        const preset: CalcdexPokemonPreset = {
          calcdexId: null,
          id: null,
          source: 'bundle',
          name: 'Randoms',
          gen,
          format: genlessFormat,
          speciesForme,
          level: entry.level,
          // randbats convention: max-ish neutral spread (matches Showdex's randoms defaults)
          ivs: {
            hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31,
          },
          evs: {
            hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85,
          },
        };

        if (ability) {
          preset.ability = ability as AbilityName;
        }

        if (item) {
          preset.item = item as ItemName;
        }

        if (moves.length) {
          preset.moves = moves as MoveName[];
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
