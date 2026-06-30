# 🐢 Athlon Showdex v1.0.6 — "Every Format"

The big one: Athlon Showdex now understands **all** of Pokéathlon's fangame mods, plus it's caught up to upstream Showdex v1.4.0.

## 🌐 Every fangame mod, in the calc
The calculator now reads each mod's own dex and mechanics, so things finally line up with the server across the board:

- **Custom move types** resolve everywhere — e.g. in Soulstones, Aura Sphere is **Light** and Hyper Voice/Boomburst are **Sound** (effectiveness + STAB included), plus per-mod base stats, learnsets, abilities & items.
- **Custom-type damage abilities** — Soulstones (Virtuoso, Light Bulb, Affection, Maestro, Starstruck…) and Insurgence (Shadow Synergy/Call, Spirit Call, Psycho Call), including the “at low HP” ones.
- **Type-resist & immunity abilities** — Light Bulb/Terrorize (halve incoming Dark/Bug), Crystalline (halve Ground/Water), and immunities **Disenchant** (Fairy), **Lead Skin** (Nuclear), **Windy Wall** (Flying).
- **Redefined abilities, scoped correctly** — Soulstones' Battle Armor, Shell Armor, Snow Cloak, Sand Veil, Overcoat & Attunement apply **only** in Soulstones.
- **Custom items** — Soulstones Orion orbs (Void Heart/Radiant Orb ×2) and Insurgence Delta items (Dragon Fang/Scale, Light Ball → Pikachu-Delta).

Covers **Soulstones, Insurgence, Uranium, Chaos, Mariomon, Infinity** and Infinite Fusion.

## ⬆️ Upstream Showdex v1.4.0
- **Teledex / Devdex** — a built-in **“Dump Bug Report”** tool + live log viewer (please use it when reporting!).
- Smarter Randoms/preset handling, format-scoped preset pools, performance work, a Mega toggle button, and an `@smogon/calc` patch sync.
- All of our Pokéathlon work was preserved through the merge; the damage patch is verified applied.

## 🧪 Quality
- **132** unit tests pass; typecheck clean; Chrome/Edge **and** Firefox builds shipped.

## 📦 Install

**Chrome / Edge:** download the `.chrome.zip`, unzip to a permanent folder, go to `chrome://extensions` → **Developer mode** → **Load unpacked** → pick the folder (or **Reload** if you already have it). Then open a battle on [play.pokeathlon.com](https://play.pokeathlon.com) and hard-refresh (Ctrl+Shift+R).

**Firefox:** download the `.firefox.xpi`, go to `about:debugging` → **This Firefox** → **Load Temporary Add-on** → pick the `.xpi`.

## 📋 Known limitations
Some mechanics can't be modeled in a static calc and are intentionally skipped: turn-order abilities (Bushido “moves first”, Stakeout), the frostbite-specific Superconductive, Chaos' conditional Natural Anomaly, and Light Ball on Pikachu *fusion bodies*. New Moon's own damage is a close base-power approximation.

## 💜 Thank you, testers
**Psychoplasm, Aevilok, I Like Porygon2, Jaykio, NiaDoesDumbStuff & Rowlet.** Special thanks to **Jaykio** and **I Like Porygon2** for the Aegislash Stance Change work.

## 🗓️ Heads up
College is starting, so updates come **every few months** when I get a window. Bug reports (now easier with the Dump Bug Report tool) are always welcome on the [Issues](https://github.com/HowToBasicMons/Athlon-Showdex/issues) page.

## ❤️ Built on Showdex
A fork of [doshidak/showdex](https://github.com/doshidak/showdex) by **Bot Keith & analogcam** — please support them: [Patreon](https://patreon.com/showdex) · [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN). Licensed under AGPL-3.0.
