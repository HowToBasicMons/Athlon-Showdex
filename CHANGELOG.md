# Changelog

All notable changes to **Athlon Showdex** (a fork of [doshidak/showdex](https://github.com/doshidak/showdex) for [Pokéathlon](https://play.pokeathlon.com)).

## v1.0.5

Official release consolidating the v1.0.4-hotfix.1 fixes plus custom-ability support, an item/type-chart audit, and the first unit tests.

**Aegislash Stance Change (fusions) — matches Pokémon Infinite Fusion**
- Blade forme keeps the **Shield** fusion and **swaps the fused base Atk↔Def and Sp.Atk↔Sp.Def** (the real PIF mechanic), instead of re-fusing with Aegislash-Blade's own base stats.
- Blade forme **persists across battle updates** (no longer reverts to Shield), the manual Shield ⟷ Blade toggle sticks, and it works whether Aegislash is the **head or the body**.
- A fused Aegislash in Blade forme keeps its **fusion name and sprite**.

**Custom abilities**
- Fangame abilities now apply their stat effects to **both** the displayed stats and the damage calc. Covers always-on ones (Athenian / Pure Focus / Genius ×2 SpA, Sharp Coral, Tormented) and weather/terrain/status-gated ones (Sandy Defense, Ice Cleats, Forest King, Psycho Slider, Attunement, Supercell, Shadow Dance, Absolution). The custom **New Moon** weather is now tracked so its abilities resolve.

**Other fixes**
- **Eviolite** applies when *either* the head or the body is not-fully-evolved.

**Audited (confirmed correct)**
- All 12 custom stat-multiplier items are wired; the client's old dragonfang/dragonscale stat code is a client bug (type-power / evo items) and is correctly excluded.
- The custom type chart is read live from the client, so custom types & server matchup tweaks can't drift.

**Internal**
- First unit tests (`vitest`) locking down the fusion engine (`fuseStat`, `fuseBaseStats`, `fuseTypes`, `orderFusionTypes`, Aegislash Blade swap) — `pnpm test`.
- README rewritten with a mechanics-accuracy / known-limitations / pros-cons section.

## v1.0.4-hotfix.1

**Stance Change (fusions) — rebuilt to match Pokémon Infinite Fusion**
- Blade forme now uses the correct PIF mechanic: it keeps the **Shield** fusion and **swaps the fused base Atk↔Def and Sp.Atk↔Sp.Def** (previously it incorrectly re-fused using Aegislash-Blade's own base stats, giving the wrong numbers).
- Blade forme now **persists across battle updates** instead of snapping back to Shield every sync. Works whether Aegislash is the **head or the body** of the fusion.
- The manual forme toggle (Shield ⟷ Blade) now **sticks**.
- A fused Aegislash in Blade forme keeps its **fusion name and sprite** (no longer renders as a plain Aegislash-Blade).

**Other fixes**
- **Eviolite** now applies when **either** the head or the body is not-fully-evolved (e.g. a fully-evolved head fused with an NFE body like Doublade) — both in the damage calc and the displayed stats.

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
