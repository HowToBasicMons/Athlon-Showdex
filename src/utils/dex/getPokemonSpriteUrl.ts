import { formatId } from '@showdex/utils/core';

/**
 * Formes whose Showdown gen-5 sprite filename uses a hyphenated key that `formatId()` would strip.
 */
const SpriteKeyOverrides: Record<string, string> = {
  tornadustherian: 'tornadus-therian',
  thundurustherian: 'thundurus-therian',
  landorustherian: 'landorus-therian',
  enamorustherian: 'enamorus-therian',
  basculinwhitestriped: 'basculin-white',
  urshifurapidstrike: 'urshifu-rapidstrike',
};

/**
 * Builds the **vanilla Pokémon Showdown** gen-5 sprite URL for a forme.
 *
 * * This is the last-resort fallback when neither a custom Pokéathlon fusion sprite nor the live
 *   client's resolver produce a working image (e.g. Chaos-mod fusions with no custom art) — the
 *   Head species' plain Showdown sprite still renders something recognizable.
 *
 * @since 1.3.0
 */
export const getShowdownSpriteUrl = (
  forme: string,
): string => {
  const key = formatId(forme);

  if (!key) {
    return null;
  }

  return `https://play.pokemonshowdown.com/sprites/gen5/${SpriteKeyOverrides[key] || key}.png`;
};

/**
 * Builds a Pokémon sprite URL for the Calcdex `Picon`.
 *
 * * **Primary path:** the live client's own `Dex.getSpriteData()` — the same resolver that renders
 *   the in-battle sprites, so it correctly handles **every gen** (not just 1–5), custom mods
 *   (Mariomon, Chaos, Insurgence, ...) & fangame sprites. This is essential because Pokéathlon
 *   formats are gen 6/7/9 + custom mons, none of which exist in the static gen-5 sprite dir.
 * * **Fallback:** a static pokemonshowdown gen-5 sprite (older mons only), if the client resolver
 *   isn't available.
 *
 * @since 1.3.0
 */
export const getPokemonSpriteUrl = (
  forme: string,
): string => {
  if (!forme) {
    return null;
  }

  // prefer the client's sprite resolver (handles all gens + custom/fangame mons)
  try {
    const data = (typeof Dex !== 'undefined')
      && (Dex as unknown as {
        getSpriteData?: (p: unknown, isFront: boolean, opts?: Record<string, unknown>) => { url?: string };
      })?.getSpriteData?.(forme, true, { noScale: true });

    if (data?.url) {
      // url may be absolute, protocol-relative (`//play...`), or relative; normalize to an
      // absolute https url so it resolves correctly inside the injected panel (a relative url
      // would otherwise resolve against play.pokeathlon.com, which 404s the standard sprite dirs)
      if (/^https?:\/\//.test(data.url)) {
        return data.url;
      }

      if (data.url.startsWith('//')) {
        return `https:${data.url}`;
      }

      // relative url -> prefix with the client's resource origin (where the sprites actually live)
      const prefix = (Dex as unknown as { resourcePrefix?: string })?.resourcePrefix
        || 'https://play.pokemonshowdown.com/';

      return `${prefix.replace(/\/$/, '')}/${data.url.replace(/^\//, '')}`;
    }
  } catch {
    // fall through to the static fallback below
  }

  return getShowdownSpriteUrl(forme);
};
