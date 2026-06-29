import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';

/**
 * Returns whether the given `preset` belongs to the provided `genlessFormat` (gen-stripped format string).
 *
 * This is the canonical predicate for format-scoping bundle/usage/storage preset pools in Honkdex
 * (and battle Calcdex) contexts, so that — for example — a `gen9championsou` Honkdex sees only
 * championsou-format presets and not those from `championsbss`, `championsvgc2026`, `vgc2025`, etc.
 *
 * Rules (evaluated in order):
 * 1. If `genlessFormat` is falsy (non-scoped context), every preset passes — returns `true`.
 * 2. If `preset.format` is falsy (the preset bears no format tag, i.e., it's generic/global), it
 *    passes — returns `true`. This lets format-less Teambuilder entries remain accessible in any context.
 * 3. Exact match: `genlessFormat === preset.format` — returns `true`.
 * 4. Prefix match: `genlessFormat.startsWith(preset.format)` — returns `true`.
 *    - Intentional: a bundle tagged `format: 'champions'` (parent variant, no specific sub-format)
 *      is considered valid for any Champions sub-format (`'championsou'`, `'championsvgc2026'`, …).
 *    - ⚠️ The `startsWith` is *directional*: `'championsou'.startsWith('champions')` is `true`, but
 *      `'championsou'.startsWith('championsbss')` is `false`, so distinct-variant bundles (BSS, VGC, …)
 *      are correctly excluded when the current format is OU. Likewise, `'championsou'.startsWith('vgc2025')`
 *      is `false`, so a VGC 2025 bundle never leaks into a Champions OU session.
 *
 * Does **not** handle Randoms pools — callers are expected to guard against that upstream (e.g., check
 * `randoms` and skip calling this predicate when the bundle source is Randoms-specific).
 *
 * @since 1.4.3
 */
export const presetFormatMatches = (
  genlessFormat: string,
  preset: CalcdexPokemonPreset,
): boolean => {
  if (!genlessFormat || !preset?.format) {
    return true;
  }

  return genlessFormat === preset.format || genlessFormat.startsWith(preset.format);
};
