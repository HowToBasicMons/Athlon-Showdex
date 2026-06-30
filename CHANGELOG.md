# Changelog

All notable changes to **Athlon Showdex** (a fork of [doshidak/showdex](https://github.com/doshidak/showdex) for [Pokéathlon](https://play.pokeathlon.com)).

## v1.0.4

**Fixes**
- Fused typing no longer reverts to the head's typing when a Pokémon switches out and back in.
- Aegislash's **Stance Change** now works on fusions (Shield ↔ Blade, based on the last move used).
- Sprite fallback no longer pulls a **wrong sprite from another format** — falls back to the head's correct sprite, then half/half icons.
- **Dandelight** now applies to the correct forme.

**Improvements**
- **Authoritative fusion typing** — read directly from the Infinite Fusion mod data, matching the server exactly (replaces the previous approximation table).
- **Expert Moves** — fusions now show their signature tutor moves (Fiery Dance, Light of Ruin, Fleur Cannon, Thousand Arrows, …) when they qualify.
- **Mariomon sample sets** — community teams added as named, selectable presets in non-random Mariomon formats.

**Performance**
- Cached the custom type-chart resolver (was rebuilt on every damage calc).
- Cached the Pokéathlon usage download (no re-fetch per battle).

## v1.0.3 and earlier

- Pokéathlon rebrand (Athlon Showdex), Electrode-Mega icon/mascot, Pokéathlon-only injection.
- Infinite Fusion support: fused stats (head/body bias), fused typing, merged ability & move pools, fusion names & sprites.
- Custom types (Sound, Light, Cosmic, Nuclear, Crystal) wired through typing, move types, the type chart & damage.
- Custom-mod format support (Soulstones, Insurgence, Uranium, Infinity, Mariomon, Chaos).
- Pokéathlon usage presets + Mariomon Random Battle set dump.
- Custom item stat-multiplier effects (Goomba Boots, Sturdy Shell, the Orion orbs, Anchor, Assault/Muscle Armor, Wise Vest, …).
- Fixed usage presets leaking across fusions (matched by exact head + body).
