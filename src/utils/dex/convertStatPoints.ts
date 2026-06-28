/**
 * Champions EV <-> stat point conversion.
 *
 * * Per the PS `champions` mod (`data/mods/champions/scripts.ts`): *"the first stat point gives 4 EVs and the
 *   others give 8 EVs"* -- so `EV = 8*pts - 4` (for `pts > 0`), inverse `pts = (EV + 4) / 8`.
 * * `evToStatPoint()` therefore yields **fractional** ("floating") points whenever `EV + 4` isn't divisible by
 *   8 (e.g. `EV 80 -> 10.5`). These are legitimate -- `calcPokemonStat()`'s Champions branch (`max(2*pts - 1, 0)`)
 *   consumes them cleanly -- so they must be preserved, not rounded, or the damage calc drifts.
 *
 * @since 1.4.0
 */

/** Converts a standard EV (0-252) to a Champions stat point (0-32, possibly fractional). */
export const evToStatPoint = (ev: number): number => (ev > 0 ? Math.min((ev + 4) / 8, 32) : 0);

/** Converts a Champions stat point (0-32) back to its EV-equivalent (0-252) for paste export etc. */
export const statPointToEv = (points: number): number => (points > 0 ? Math.min(Math.round(8 * points - 4), 252) : 0);
