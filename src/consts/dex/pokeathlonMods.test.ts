import { describe, expect, it } from 'vitest';
import { getPokeathlonAbilityStatMods, isPokeathlonStatAbility } from './pokeathlonAbilities';
import { getPokeathlonItemStatMods } from './pokeathlonItems';

describe('getPokeathlonItemStatMods', () => {
  it('applies a species-gated item to a matching holder (Goomba Boots → ×2 Spe)', () => {
    expect(getPokeathlonItemStatMods('Goomba Boots', 'Goomba')).toEqual({ spe: 2 });
  });

  it('matches the species on either the Head or the Body of a fusion', () => {
    // body = Goomba Stack
    expect(getPokeathlonItemStatMods('goombaboots', 'Pikachu', 'Goomba Stack')).toEqual({ spe: 2 });
  });

  it('does not apply a species-gated item to a non-matching holder', () => {
    expect(getPokeathlonItemStatMods('Goomba Boots', 'Pikachu')).toEqual({});
  });

  it('applies an any-holder item (Anchor → ×0.5 Spe) regardless of species', () => {
    expect(getPokeathlonItemStatMods('anchor', 'Snorlax')).toEqual({ spe: 0.5 });
  });

  it('stacks Anchor + Dhelmise (×0.5 Spe and ×1.5 Atk)', () => {
    expect(getPokeathlonItemStatMods('anchor', 'Dhelmise')).toEqual({ spe: 0.5, atk: 1.5 });
  });

  it('returns empty for an unknown / vanilla item', () => {
    expect(getPokeathlonItemStatMods('Choice Band', 'Garchomp')).toEqual({});
    expect(getPokeathlonItemStatMods('', 'Garchomp')).toEqual({});
  });
});

describe('getPokeathlonAbilityStatMods', () => {
  it('applies always-on abilities (Athenian → ×2 SpA)', () => {
    expect(getPokeathlonAbilityStatMods('Athenian')).toEqual({ spa: 2 });
  });

  it('applies Sharp Coral as both boosts & drops', () => {
    expect(getPokeathlonAbilityStatMods('sharpcoral')).toEqual({
      atk: 2, spa: 2, def: 0.5, spd: 0.5,
    });
  });

  it('gates weather abilities on the active weather', () => {
    expect(getPokeathlonAbilityStatMods('sandydefense', { weather: 'sand' })).toEqual({ def: 1.5, spd: 1.5 });
    expect(getPokeathlonAbilityStatMods('sandydefense', { weather: 'rain' })).toEqual({});
    expect(getPokeathlonAbilityStatMods('sandydefense', {})).toEqual({});
  });

  it('gates terrain abilities on the active terrain', () => {
    expect(getPokeathlonAbilityStatMods('psychoslider', { terrain: 'psychic' })).toEqual({ spe: 2 });
    expect(getPokeathlonAbilityStatMods('psychoslider', { terrain: 'grassy' })).toEqual({});
  });

  it('gates status abilities on a non-volatile status', () => {
    expect(getPokeathlonAbilityStatMods('attunement', { status: true })).toEqual({ atk: 1.5 });
    expect(getPokeathlonAbilityStatMods('attunement', { status: false })).toEqual({});
  });

  it('resolves New Moon weather abilities', () => {
    expect(getPokeathlonAbilityStatMods('shadowdance', { weather: 'newmoon' })).toEqual({ spe: 2 });
    expect(getPokeathlonAbilityStatMods('supercell', { weather: 'newmoon' })).toEqual({ spa: 1.5 });
    expect(getPokeathlonAbilityStatMods('supercell', { weather: 'rain' })).toEqual({ spa: 1.5 });
  });

  it('skips conditional rules when unconditionalOnly is set (damage-calc path w/o field)', () => {
    // always-on still applies
    expect(getPokeathlonAbilityStatMods('athenian', { weather: 'sand' }, true)).toEqual({ spa: 2 });
    // conditional is skipped even if its condition would otherwise match
    expect(getPokeathlonAbilityStatMods('sandydefense', { weather: 'sand' }, true)).toEqual({});
  });

  it('returns empty for an unknown / vanilla ability', () => {
    expect(getPokeathlonAbilityStatMods('Levitate')).toEqual({});
  });

  it('isPokeathlonStatAbility flags only known custom stat abilities', () => {
    expect(isPokeathlonStatAbility('athenian')).toBe(true);
    expect(isPokeathlonStatAbility('Sharp Coral')).toBe(true);
    expect(isPokeathlonStatAbility('Levitate')).toBe(false);
  });
});
