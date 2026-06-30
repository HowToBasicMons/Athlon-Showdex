# 🐢 Athlon Showdex v1.0.6 — "Upstream Sync"

Athlon Showdex catches up to **upstream Showdex v1.4.0** — all of our Pokéathlon work is preserved, with upstream's newest features and fixes merged in on top.

## ⬆️ From upstream (Showdex v1.4.0)
- **Teledex / Devdex** — a built-in **"Dump Bug Report"** tool + live log viewer. If something looks wrong, you can now hand us a reproducible report. 🙏
- **Preset improvements** — smarter Randoms guessing (no longer gated on the revealed item, proper Mega-stone handling), mega/primal forme folding, and format-scoped preset pools (no more cross-format sets leaking in).
- **Performance** — log ring-buffer, throttled re-renders, and hot-path trims for a snappier calc.
- **Mega toggle button** in the moves panel, plus an `@smogon/calc` patch sync.

## 🛡️ Nothing of ours changed
Everything Pokéathlon-specific carried over **untouched** — fusion stats/typing, Aegislash Stance Change, custom abilities & items, New Moon weather, Expert Moves, the usage/sample-set presets, sprites, and the rebrand. The `@smogon/calc` damage patch is verified still applied.

## 🧪 Quality
- Added regression tests for the custom item/ability resolvers — **110 tests** pass.
- Typecheck clean; Chrome/Edge **and** Firefox builds shipped.

## 📦 Install

**Chrome / Edge**
1. Download `showdex-v1.0.6-*.chrome.zip` below and unzip it to a permanent folder.
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick the folder (or hit **Reload** if you already have it).
3. Open a battle on [play.pokeathlon.com](https://play.pokeathlon.com) and hard-refresh (Ctrl+Shift+R).

**Firefox**
1. Download `showdex-v1.0.6-*.firefox.xpi` below.
2. `about:debugging` → **This Firefox** → **Load Temporary Add-on** → pick the `.xpi`.

## 📋 Known limitations
- Manual Blade/Shield toggle only works when Aegislash is the **head** (as the body, it relies on the auto-switch).
- New Moon's damage is a close base-power approximation (a roll may be ~1 HP off the exact in-game chain).
- Preset depth varies by mod (Mariomon has the most; others lean on usage data).

## 💜 Thank you, testers
**Psychoplasm, Aevilok, I Like Porygon2, Jaykio, NiaDoesDumbStuff & Rowlet** — thank you. Special shoutout to **Jaykio** and **I Like Porygon2** for the Aegislash Stance Change work.

## 🗓️ Heads up on updates
College is starting soon, so updates will come **every few months** when I get a window rather than constantly. Bug reports (now easier with the Dump Bug Report tool!) are always welcome on the [Issues](https://github.com/HowToBasicMons/Athlon-Showdex/issues) page.

## ❤️ Built on Showdex
A fork of [doshidak/showdex](https://github.com/doshidak/showdex) by **Bot Keith & analogcam** — none of this exists without their work. Please support them: [Patreon](https://patreon.com/showdex) · [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN). Licensed under AGPL-3.0.
