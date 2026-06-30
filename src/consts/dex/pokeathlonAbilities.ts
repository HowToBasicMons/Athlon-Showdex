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
  /**
   * Active Pokéathlon **server mod id** (e.g. `'gen9soulstones'`), from `getPokeathlonModId()`.
   *
   * * Required to apply any **mod-scoped** rule (see `PokeathlonAbilityStatModRule.scope`) — e.g. an
   *   ability a specific mod *redefines* from its vanilla behavior (Soulstones' Battle Armor →
   *   SpD ×1.2). Un-scoped (custom-name) rules apply regardless.
   */
  modId?: string;
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
  /**
   * Optional mod scope — a list of mod slugs (e.g. `['soulstones']`, the part after `gen<#>`).
   *
   * * **Required** for any ability a mod *redefines* from a vanilla ability (e.g. Battle Armor),
   *   so the rule doesn't wrongly fire in other formats. Omit for custom-name abilities that only
   *   exist in Pokéathlon mods (safe to apply universally).
   */
  scope?: string[];
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
  { abilities: ['shadowdance'], mods: { spe: 2 }, condition: { weather: ['newmoon'] } },
  { abilities: ['absolution'], mods: { spa: 1.5 }, condition: { weather: ['newmoon'] } },
  { abilities: ['supercell'], mods: { spa: 1.5 }, condition: { weather: ['rain', 'heavyrain', 'newmoon'] } },

  // terrain-gated
  { abilities: ['forestking'], mods: { atk: 1.3333, spa: 1.3333 }, condition: { terrain: ['grassy'] } },
  { abilities: ['psychoslider'], mods: { spe: 2 }, condition: { terrain: ['psychic'] } },

  // --- Soulstones: vanilla abilities the mod redefines (must be mod-scoped!) ---
  { abilities: ['battlearmor'], mods: { spd: 1.2 }, scope: ['soulstones'] },
  { abilities: ['shellarmor'], mods: { def: 1.2 }, scope: ['soulstones'] },
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

  // active mod slug (e.g. 'soulstones') derived from the modId, for mod-scoped rules
  const activeModSlug = context.modId ? context.modId.replace(/^gen\d+/, '') : null;

  PokeathlonAbilityStatMods.forEach((rule) => {
    if (!rule.abilities.includes(id)) {
      return;
    }

    // mod-scoped rules (e.g. a vanilla ability a mod redefines) only apply in their mod
    if (rule.scope?.length && (!activeModSlug || !rule.scope.includes(activeModSlug))) {
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

/**
 * A Pokéathlon custom **move-type damage-booster** ability rule.
 *
 * * These abilities multiply the holder's offensive output for moves of a specific type (the fangame
 *   equivalent of Blaze/Transistor for custom types), which `@smogon/calc` doesn't know. Showdex
 *   approximates them as a base-power modifier on the move (see `createSmogonMove()`).
 *
 * @since 1.0.7
 */
export interface PokeathlonAbilityMoveBoostRule {
  /** Ability ids (via `formatId()`) this rule applies to. */
  abilities: string[];
  /** Move types (proper-cased) the boost applies to. */
  moveTypes: string[];
  /** Damage multiplier (e.g. `1.5`, `2`). */
  multiplier: number;
  /** If set, only applies while the holder is at <= 1/3 of its max HP (Blaze/Overgrow-style). */
  requiresLowHp?: boolean;
  /** Mod slugs this applies in (e.g. `['soulstones']`) — see `PokeathlonAbilityStatModRule.scope`. */
  scope?: string[];
}

/**
 * Custom-type offensive booster abilities (Soulstones).
 *
 * * Ported from the server `data/mods/gen9soulstones/abilities.ts` (`onModifyAtk`/`onModifySpA`
 *   gated on `move.type`). Mod-scoped so they never fire in other formats.
 * * Note: Light Bulb & Terrorize *also* halve an incoming type defensively (Dark/Bug respectively);
 *   only their offensive boost is modeled here.
 *
 * @since 1.0.7
 */
export const PokeathlonAbilityMoveBoosts: PokeathlonAbilityMoveBoostRule[] = [
  { abilities: ['affection'], moveTypes: ['Fairy'], multiplier: 1.5, scope: ['soulstones'] },
  { abilities: ['arsonist'], moveTypes: ['Fire'], multiplier: 1.5, scope: ['soulstones'] },
  { abilities: ['requiem'], moveTypes: ['Dark'], multiplier: 1.5, scope: ['soulstones'] },
  { abilities: ['haunted'], moveTypes: ['Ghost'], multiplier: 1.5, scope: ['soulstones'] },
  { abilities: ['bonecollector'], moveTypes: ['Ground'], multiplier: 1.5, scope: ['soulstones'] },
  { abilities: ['virtuoso'], moveTypes: ['Sound'], multiplier: 1.5, scope: ['soulstones'] },
  { abilities: ['hivemind'], moveTypes: ['Bug'], multiplier: 1.5, scope: ['soulstones'] },
  { abilities: ['lightbulb'], moveTypes: ['Light'], multiplier: 2, scope: ['soulstones'] },
  { abilities: ['terrorize'], moveTypes: ['Psychic'], multiplier: 2, scope: ['soulstones'] },
  { abilities: ['maestro'], moveTypes: ['Sound'], multiplier: 1.5, requiresLowHp: true, scope: ['soulstones'] },
  { abilities: ['spellcaster'], moveTypes: ['Psychic'], multiplier: 1.5, requiresLowHp: true, scope: ['soulstones'] },
  { abilities: ['starstruck'], moveTypes: ['Cosmic'], multiplier: 1.5, requiresLowHp: true, scope: ['soulstones'] },
  { abilities: ['irradiate'], moveTypes: ['Light'], multiplier: 1.5, requiresLowHp: true, scope: ['soulstones'] },
];

/**
 * Computes the damage multiplier a custom move-type-booster ability applies to a move of `moveType`.
 *
 * * Returns `1` if the ability doesn't boost that type (or its mod/HP condition isn't met).
 * * `lowHp` = holder is at <= 1/3 max HP; `modId` = active server mod id (for scoping).
 *
 * @since 1.0.7
 */
export const getPokeathlonAbilityMoveBoost = (
  ability: string,
  moveType: string,
  context: { lowHp?: boolean; modId?: string } = {},
): number => {
  const id = formatId(ability);

  if (!id || !moveType) {
    return 1;
  }

  const activeModSlug = context.modId ? context.modId.replace(/^gen\d+/, '') : null;

  return PokeathlonAbilityMoveBoosts.reduce((mult, rule) => {
    if (!rule.abilities.includes(id) || !rule.moveTypes.includes(moveType)) {
      return mult;
    }

    if (rule.scope?.length && (!activeModSlug || !rule.scope.includes(activeModSlug))) {
      return mult;
    }

    if (rule.requiresLowHp && !context.lowHp) {
      return mult;
    }

    return mult * rule.multiplier;
  }, 1);
};
