import * as React from 'react';
import { type GenerationNum } from '@smogon/calc';
import { type CalcdexPokemonAlt, type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { calcPresetCalcdexId } from '@showdex/utils/calc';
import { formatId, runtimeFetch } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import { detectGenFromFormat, getDexForFormat, getGenlessFormat } from '@showdex/utils/dex';

/**
 * Base URL for the Pokéathlon monthly usage + sets API.
 *
 * * Each `{YYYY-MM}.json` is keyed by genful format id (e.g. `gen7ifdexou`), each containing
 *   `{ total: { battles }, species: { id: games }, sets: { id: { abilities, items, moves } },
 *   winrates: { id: { rate } } }`.
 * * Fusion species are keyed `head+body` (e.g. `sylveon+flygon`); ability/item/move keys are ids.
 */
const PokeathlonUsageBaseUrl = 'https://usage.pokeathlon.com/raw';

/** How many recent months to try (newest first) before giving up. */
const PokeathlonUsageMonthsToTry = 4;

interface PokeathlonUsageSet {
  abilities?: Record<string, number>;
  items?: Record<string, number>;
  moves?: Record<string, number>;
}

interface PokeathlonUsageFormat {
  total?: { battles?: number };
  species?: Record<string, number>;
  sets?: Record<string, PokeathlonUsageSet>;
  winrates?: Record<string, { rate?: number }>;
}

type PokeathlonUsageResponse = Record<string, PokeathlonUsageFormat>;

const l = logger('@showdex/utils/presets/usePokeathlonPresets()');

/** Returns the most recent `count` months as `YYYY-MM` strings, newest first. */
const recentMonths = (count: number): string[] => {
  const now = new Date();
  const out: string[] = [];

  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return out;
};

/** Converts a `{ id: count }` usage dict into sorted `[Name, fraction]` alts (descending). */
const usageAltsFromCounts = (
  dict: Record<string, number>,
  resolveName: (id: string) => string,
): CalcdexPokemonAlt<string>[] => {
  const entries = Object.entries(dict || {});
  const total = entries.reduce((sum, [, count]) => sum + (count || 0), 0) || 1;

  return entries
    .map(([id, count]) => [resolveName(id), (count || 0) / total] as CalcdexPokemonAlt<string>)
    .filter((alt) => !!(alt as [string, number])[0])
    .sort((a, b) => (b as [string, number])[1] - (a as [string, number])[1]);
};

/**
 * Transforms a single Pokéathlon usage `format` block into `CalcdexPokemonPreset`s.
 *
 * @since 1.3.0
 */
export const transformPokeathlonUsage = (
  formatData: PokeathlonUsageFormat,
  format: string,
  gen: GenerationNum,
): CalcdexPokemonPreset[] => {
  const dex = getDexForFormat(format);
  const genlessFormat = getGenlessFormat(format);
  const sets = formatData?.sets || {};
  const totalBattles = formatData?.total?.battles || 0;

  if (!dex || !Object.keys(sets).length) {
    return [];
  }

  const output: CalcdexPokemonPreset[] = [];

  Object.entries(sets).forEach(([key, set]) => {
    if (!key || !set) {
      return;
    }

    const [headId, bodyId] = key.split('+');
    const headSpecies = dex.species.get(headId);

    if (!headSpecies?.exists || !headSpecies.name) {
      return;
    }

    const bodySpecies = bodyId ? dex.species.get(bodyId) : null;

    const preset: CalcdexPokemonPreset = {
      calcdexId: null,
      id: null,
      source: 'usage',
      name: 'Pokéathlon Usage',
      gen,
      format: genlessFormat,
      speciesForme: headSpecies.name,
    };

    if (bodySpecies?.exists && bodySpecies.name) {
      preset.fusion = bodySpecies.name;
    }

    const games = formatData?.species?.[key] || 0;

    if (totalBattles > 0 && games > 0) {
      preset.formeUsage = games / totalBattles;
    }

    const altAbilities = usageAltsFromCounts(set.abilities, (id) => dex.abilities.get(id)?.name);
    const altItems = usageAltsFromCounts(set.items, (id) => dex.items.get(id)?.name);
    const altMoves = usageAltsFromCounts(set.moves, (id) => dex.moves.get(id)?.name);

    if (altAbilities.length) {
      preset.altAbilities = altAbilities as CalcdexPokemonPreset['altAbilities'];
      preset.ability = (altAbilities[0] as [string, number])[0] as CalcdexPokemonPreset['ability'];
    }

    if (altItems.length) {
      preset.altItems = altItems as CalcdexPokemonPreset['altItems'];
      preset.item = (altItems[0] as [string, number])[0] as CalcdexPokemonPreset['item'];
    }

    if (altMoves.length) {
      preset.altMoves = altMoves as CalcdexPokemonPreset['altMoves'];
      preset.moves = (altMoves as [string, number][]).slice(0, 4).map((m) => m[0]) as CalcdexPokemonPreset['moves'];
    }

    preset.calcdexId = calcPresetCalcdexId(preset);
    preset.id = preset.calcdexId;

    output.push(preset);
  });

  return output;
};

/**
 * Fetches & transforms Pokéathlon's own monthly usage + sets data into presets for the given format.
 *
 * * Replaces the (inapplicable) Smogon usage sets for Pokéathlon formats with the server's real
 *   usage data — including fusion sets (keyed `head+body`).
 * * Tries the most recent months in order until a month with data for this format is found.
 *
 * @since 1.3.0
 */
export const usePokeathlonPresets = (
  format: string,
  config?: { disabled?: boolean },
): { loading: boolean; presets: CalcdexPokemonPreset[] } => {
  const { disabled } = config || {};

  const [presets, setPresets] = React.useState<CalcdexPokemonPreset[]>([]);
  const [loading, setLoading] = React.useState(false);

  const gen = detectGenFromFormat(format);
  const formatKey = formatId(format);

  React.useEffect(() => {
    if (disabled || !format || !gen || !formatKey) {
      setPresets([]);

      return undefined;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);

      try {
        // eslint-disable-next-line no-restricted-syntax
        for (const month of recentMonths(PokeathlonUsageMonthsToTry)) {
          // eslint-disable-next-line no-await-in-loop
          const response = await runtimeFetch<PokeathlonUsageResponse>(`${PokeathlonUsageBaseUrl}/${month}.json`);

          if (!response?.ok) {
            continue;
          }

          const json = response.json();
          const formatData = json?.[formatKey];

          if (formatData?.sets && Object.keys(formatData.sets).length) {
            if (!cancelled) {
              setPresets(transformPokeathlonUsage(formatData, format, gen));
            }

            return;
          }
        }

        if (!cancelled) {
          setPresets([]);
        }
      } catch (error) {
        if (__DEV__) {
          l.warn('Failed to fetch Pokéathlon usage presets for', format, '\n', error);
        }

        if (!cancelled) {
          setPresets([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [disabled, format, formatKey, gen]);

  return { loading, presets };
};
