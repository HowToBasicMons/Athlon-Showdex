# 🐢 Athlon Showdex v1.0.5

Official release — Aegislash **Stance Change** now matches Pokémon Infinite Fusion, plus custom-ability support, an item/type-chart audit, and the first unit tests.

## 🗡️ Stance Change (fusions)
- Blade forme keeps the **Shield** fusion and **swaps the fused base Atk↔Def & Sp.Atk↔Sp.Def** — the real PIF mechanic (no longer re-fuses with Aegislash-Blade's base stats).
- Blade **persists** across battle updates and via the manual Shield ⟷ Blade toggle. Works whether Aegislash is the **head or body**.
- Keeps the correct **fusion name and sprite** in Blade forme.

## ✨ Custom abilities
- Fangame abilities now apply their stat effects to **both** the stat display and the damage calc. Always-on (Athenian / Pure Focus / Genius ×2 SpA, Sharp Coral, Tormented) plus weather/terrain/status ones (Sandy Defense, Ice Cleats, Forest King, Psycho Slider, Attunement, Supercell, Shadow Dance, Absolution). The custom **New Moon** weather is now tracked so its abilities resolve.

## 🛠️ Fixes
- **Eviolite** applies when **either** half is not-fully-evolved.

## ✅ Audited / hardened
- Confirmed all 12 custom stat-multiplier items are correctly wired (and the buggy dragonfang/dragonscale client code is correctly excluded).
- Confirmed the custom type chart is read live from the client, so it can't drift from the server.
- Added the first **unit tests** for the fusion engine so future changes don't regress.

## 📦 Install
1. Download the `.zip` below, unzip to a permanent folder.
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick the folder (or hit **Reload** if you already have it).
3. Open a battle on [play.pokeathlon.com](https://play.pokeathlon.com) and hard-refresh (Ctrl+Shift+R).

## 📋 Known limitations
- Manual Blade/Shield toggle only when Aegislash is the **head** (body relies on auto-switch).
- New Moon weather is tracked for abilities, but its own Ghost/Dark & Fairy damage modifiers aren't in the calc yet (and it auto-syncs from battles rather than being manually selectable).
- Chrome/Edge only (no Firefox build yet).

## ❤️ Built on Showdex
A fork of [doshidak/showdex](https://github.com/doshidak/showdex) by **Bot Keith & analogcam** — please support them: [Patreon](https://patreon.com/showdex) · [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN).

Thanks to beta testers **Psychoplasm, Aevilok, I Like Porygon2, Jaykio, NiaDoesDumbStuff & Rowlet** 💜 — with special thanks to **Jaykio** and **I Like Porygon2** for testing & helping nail down the Aegislash fusion Stance Change.
