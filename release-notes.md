# 🐢 Athlon Showdex v1.0.5

Official release — Aegislash **Stance Change** now matches Pokémon Infinite Fusion, plus custom-ability support, an item/type-chart audit, and the first unit tests.

## 🗡️ Stance Change (fusions)
- Blade forme keeps the **Shield** fusion and **swaps the fused base Atk↔Def & Sp.Atk↔Sp.Def** — the real PIF mechanic (no longer re-fuses with Aegislash-Blade's base stats).
- Blade **persists** across battle updates and via the manual Shield ⟷ Blade toggle. Works whether Aegislash is the **head or body**.
- Keeps the correct **fusion name and sprite** in Blade forme.

## ✨ Custom abilities
- Fangame abilities now apply their stat effects to **both** the stat display and the damage calc. Always-on (Athenian / Pure Focus / Genius ×2 SpA, Sharp Coral, Tormented) plus weather/terrain/status ones (Sandy Defense, Ice Cleats, Forest King, Psycho Slider, Attunement, Supercell, Shadow Dance, Absolution).

## 🌑 New Moon weather
- Now tracked, **manually selectable** in the weather dropdown, and its damage modifiers (Ghost/Dark ×1.35, Fairy ×0.75) are applied in the calc.

## 🎓 Expert (signature) moves
- Now use the client's **full evolution-line expansion** (both Head & Body lines, both orderings, per-pairing typing) — fixing missing/over-eager signature moves.

## 🛠️ Fixes
- **Eviolite** applies when **either** half is not-fully-evolved.

## 🦊 Builds
- A **Firefox** build is now produced alongside Chrome/Edge.

## ✅ Audited / hardened
- Confirmed all 12 custom stat-multiplier items are correctly wired (and the buggy dragonfang/dragonscale client code is correctly excluded).
- Confirmed the custom type chart is read live from the client, so it can't drift from the server.
- Added the first **unit tests** for the fusion engine so future changes don't regress.

## 📦 Install
1. Download the `.zip` below, unzip to a permanent folder.
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick the folder (or hit **Reload** if you already have it).
3. Open a battle on [play.pokeathlon.com](https://play.pokeathlon.com) and hard-refresh (Ctrl+Shift+R).

**Firefox:** grab the `.xpi` instead → `about:debugging` → **This Firefox** → **Load Temporary Add-on** → pick the `.xpi`.

## 📋 Known limitations
- Manual Blade/Shield toggle only when Aegislash is the **head** (body relies on auto-switch).
- New Moon damage is a close base-power approximation (a roll may be ~1 HP off the exact in-game chain).

## ❤️ Built on Showdex
A fork of [doshidak/showdex](https://github.com/doshidak/showdex) by **Bot Keith & analogcam** — please support them: [Patreon](https://patreon.com/showdex) · [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN).

Thanks to beta testers **Psychoplasm, Aevilok, I Like Porygon2, Jaykio, NiaDoesDumbStuff & Rowlet** 💜 — with special thanks to **Jaykio** and **I Like Porygon2** for testing & helping nail down the Aegislash fusion Stance Change.
