import { formatId } from '@showdex/utils/core';

/**
 * Context available when resolving a Pokéathlon custom-ability stat modifier.
 *
 * * Mirrors the conditions the live client's `calculateModifiedStats()` checks for these abilities.
 * * All fields optional — an omitted field means "unknown / not in that state", so a conditional
 *   rule simply won't apply (which is the safe default, e.g. in the damage-calc path where the
 *   battle field isn't available).
 *
 * @since 1.0.5
 */
export interface PokeathlonAbilityContext {
  /** Sanitized active weather id (e.g. `'sand'`, `'hail'`, `'snow'`, `'sun'`, `'rain'`). */
  weather?: string;
  /** Sanitized active terrain id (e.g. `'grassy'`, `'electric'`, `'psychic'`). */
  terrain?: string;
  /** Whether the holder currently has a non-volatile status condition. */
  status?: boolean;
}

/**
 * A Pokéathlon custom-ability stat-multiplier rule.
 *
 * @since 1.0.5
 */
export interface PokeathlonAbilityStatModRule {
  /** Ability ids (via `formatId()`) this rule applies to. */
  abilities: string[];
  /** Stat -> multiplier map (e.g. `{ spa: 2 }` for ×2 Sp. Atk). */
  mods: Partial<Record<Showdown.StatName, number>>;
  /**
   * Optional activation condition. Omit for always-on abilities.
   *
   * * `weather` / `terrain`: the rule applies only if the context's weather/terrain id is in the list.
   * * `status`: the rule applies only if the holder has a non-volatile status.
   */
  condition?: {
    weather?: string[];
    terrain?: string[];
    status?: boolean;
  };
}

/**
 * Stat-multiplier effects for Pokéathlon's custom abilities (Insurgence / Uranium / etc.).
 *
 * * Ported 1:1 from the live client's `calculateModifiedStats()` ability checks. `@smogon/calc`
 *   doesn't know these fangame abilities, so Showdex applies them itself — to the displayed final
 *   stats (`calcPokemonFinalStats`, which has full field context) &, for the **always-on** ones, to
 *   the `rawStats` fed into the damage calc (`createSmogonPokemon`).
 * * Conditional rules (weather / terrain / status) are reflected in the displayed stats; only the
 *   unconditional ones are pre-applied to the damage calc (the calc path has no field context).
 *   Vanilla weather/terrain abilities (Chlorophyll, Solar Power, …) are already handled separately.
 *
 * @since 1.0.5
 */
export const PokeathlonAbilityStatMods: PokeathlonAbilityStatModRule[] = [
  // always-on
  { abilities: ['athenian', 'purefocus', 'genius'], mods: { spa: 2 } },
  { abilities: ['sharpcoral'], mods: { atk: 2, spa: 2, def: 0.5, spd: 0.5 } },
  { abilities: ['tormented'], mods: { spa: 1.5 } },

  // status-gated (Guts-style)
  { abilities: ['attunement'], mods: { atk: 1.5 }, condition: { status: true } },

  // weather-gated
  { abilities: ['sandydefense'], mods: { def: 1.5, spd: 1.5 }, condition: { weather: ['sand'] } },
  { abilities: ['icecleats'], mods: { spe: 2 }, condition: { weather: ['hail', 'snow'] } },

  // terrain-gated
  { abilities: ['forestking'], mods: { atk: 1.3333, spa: 1.3333 }, condition: { terrain: ['grassy'] } },
  { abilities: ['psychoslider'], mods: { spe: 2 }, condition: { terrain: ['psychic'] } },
];

/**
 * Whether the given ability id has *any* rule in {@link PokeathlonAbilityStatMods} (used to decide
 * if it's a Pokéathlon-custom stat ability at all).
 *
 * @since 1.0.5
 */
export const isPokeathlonStatAbility = (
  ability: string,
): boolean => {
  const id = formatId(ability);

  return !!id && PokeathlonAbilityStatMods.some((rule) => rule.abilities.includes(id));
};

/**
 * Computes the net stat multipliers for a Pokéathlon custom ability, given the battle context.
 *
 * * Returns a `{ stat: multiplier }` map (only stats that are actually modified).
 * * `unconditionalOnly` skips every conditional rule — used by the damage-calc path, which has no
 *   field context, so only always-on abilities get pre-applied to `rawStats`.
 *
 * @since 1.0.5
 */
export const getPokeathlonAbilityStatMods = (
  ability: string,
  context: PokeathlonAbilityContext = {},
  unconditionalOnly = false,
): Partial<Record<Showdown.StatName, number>> => {
  const id = formatId(ability);

  if (!id) {
    return {};
  }

  const output: Partial<Record<Showdown.StatName, number>> = {};

  PokeathlonAbilityStatMods.forEach((rule) => {
    if (!rule.abilities.includes(id)) {
      return;
    }

    if (rule.condition) {
      if (unconditionalOnly) {
        return;
      }

      const { weather, terrain, status } = rule.condition;

      if (weather?.length && !weather.includes(context.weather)) {
        return;
      }

      if (terrain?.length && !terrain.includes(context.terrain)) {
        return;
      }

      if (status && !context.status) {
        return;
      }
    }

    (Object.entries(rule.mods) as [Showdown.StatName, number][]).forEach(([stat, mult]) => {
      output[stat] = (output[stat] ?? 1) * mult;
    });
  });

  return output;
};
