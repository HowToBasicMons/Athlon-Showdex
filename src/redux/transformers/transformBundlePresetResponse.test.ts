import {
 describe, expect, it, vi,
} from 'vitest';

// mock the two sub-transformers so we test ONLY the shape-based routing (not their Dex-dependent guts)
vi.mock('./transformFormatStatsResponse', () => ({
  transformFormatStatsResponse: vi.fn(() => [{ name: 'Showdown Usage', source: 'usage' }]),
}));
vi.mock('./transformFormatPresetResponse', () => ({
  transformFormatPresetResponse: vi.fn(() => [{ name: 'Some Set', source: 'bundle' }]),
}));

const { transformBundlePresetResponse } = await import('./transformBundlePresetResponse');
const { transformFormatStatsResponse } = await import('./transformFormatStatsResponse');
const { transformFormatPresetResponse } = await import('./transformFormatPresetResponse');

const args = { gen: 9, format: 'championsou' } as never;

describe('transformBundlePresetResponse()', () => {
  it('routes a usage-stats-shaped payload ({ pokemon: {...} }) to the stats transformer', () => {
    const out = transformBundlePresetResponse(
      { pokemon: { Garchomp: { usage: { weighted: 0.5 }, abilities: { 'Rough Skin': 1 } } } } as never,
      null,
      args,
    );

    expect(transformFormatStatsResponse).toHaveBeenCalledOnce();
    expect(transformFormatPresetResponse).not.toHaveBeenCalled();
    expect(out[0].source).toBe('usage');
  });

  it('routes a sets-shaped payload ({ [mon]: { [setName]: set } }) to the preset transformer', () => {
    const out = transformBundlePresetResponse(
      { Venusaur: { 'Sun Sleep Offense': { ability: 'Chlorophyll', moves: ['Leaf Storm'] } } } as never,
      null,
      args,
    );

    expect(transformFormatPresetResponse).toHaveBeenCalledOnce();
    expect(out[0].source).toBe('bundle');
  });

  it('treats an empty payload as sets (no spurious usage routing)', () => {
    transformBundlePresetResponse({} as never, null, args);
    expect(transformFormatPresetResponse).toHaveBeenCalledOnce();
  });
});
