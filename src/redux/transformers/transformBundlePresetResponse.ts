import { type PkmnApiSmogonFormatPresetResponse, type PkmnApiSmogonPresetRequest } from '@showdex/interfaces/api';
import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { nonEmptyObject } from '@showdex/utils/core';
import { transformFormatPresetResponse } from './transformFormatPresetResponse';
import { transformFormatStatsResponse } from './transformFormatStatsResponse';

/**
 * Transforms a locally-bundled preset payload into `CalcdexPokemonPreset[]`'s, auto-routing by shape.
 *
 * * Bundles come in two flavors:
 *   - **Sets** (e.g. the NCP Champions bundle): a `{ [speciesForme]: { [presetName]: set } }` map, handled
 *     by `transformFormatPresetResponse()` (discrete named sets).
 *   - **Usage stats** (e.g. the Smogon Champions usage bundles): a `{ pokemon: { [speciesForme]: stats } }`
 *     object -- the same shape the pkmn Format Stats API serves -- handled by `transformFormatStatsResponse()`
 *     (a `'Showdown Usage'` preset per mon, with usage-% alts + spreads).
 * * Lets bakedex serve usage presets for formats the pkmn APIs don't publish (e.g. `gen9champions*`),
 *   reusing the exact same usage transform Showdex already uses for mainline formats -- no new runtime code.
 *
 * @since 1.4.0
 */
export const transformBundlePresetResponse = (
  response: PkmnApiSmogonFormatPresetResponse,
  meta: unknown,
  args: PkmnApiSmogonPresetRequest,
): CalcdexPokemonPreset[] => (
  nonEmptyObject((response as { pokemon?: Record<string, unknown> })?.pokemon)
    ? transformFormatStatsResponse(response as never, meta as never, args)
    : transformFormatPresetResponse(response, meta, args)
);
