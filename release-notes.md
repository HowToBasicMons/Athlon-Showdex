# 🐢 Athlon Showdex v1.0.5 — "Stance & Substance"

The first **official** release of Athlon Showdex — the Calcdex damage calculator, rebuilt for Pokéathlon's Infinite Fusion + fangame mechanics. This one's a big accuracy pass: Aegislash fusions, custom abilities, custom weather, and full signature-move coverage all now line up with the server.

## ⭐ Highlights

**🗡️ Aegislash Stance Change (fusions)**
Matches Pokémon Infinite Fusion now. Blade forme keeps the Shield fusion and **swaps the fused Atk↔Def & SpA↔SpD** (not a re-fuse with Aegislash-Blade's base stats). It auto-switches from the last move used, **persists** across battle updates, keeps the correct **fusion name + sprite**, and works whether Aegislash is the **head or the body**.

**✨ Custom abilities**
Fangame abilities now affect **both** the displayed stats and the damage numbers — always-on ones (Athenian / Pure Focus / Genius ×2 SpA, Sharp Coral, Tormented) and the conditional ones (Sandy Defense, Ice Cleats, Forest King, Psycho Slider, Attunement, Supercell, Shadow Dance, Absolution).

**🌑 New Moon weather**
Tracked, **manually selectable** in the weather dropdown, and its damage modifiers (Ghost/Dark ×1.35, Fairy ×0.75) are applied in the calc.

**🎓 Expert (signature) moves**
Full evolution-line expansion — both Head & Body lines, both orderings, per-pairing typing — matching the client exactly. No more missing or over-eager signature moves.

**�️ Eviolite & items**
Eviolite applies when **either** half is not-fully-evolved. All custom stat-multiplier items (Goomba Boots, Sturdy Shell, the Orion orbs, Anchor, Assault/Muscle Armor, Wise Vest, Arcane Spellbook, …) are wired into both the stats and the calc.

**🧱 Under the hood**
Fused stats & typing read straight from the Infinite Fusion data; the custom type chart (Sound / Light / Cosmic / Nuclear / Crystal) is read live from the client so it can't drift. Added the first unit tests for the fusion engine. **Firefox** build now ships alongside Chrome/Edge.

## 📦 Install

**Chrome / Edge**
1. Download `showdex-v1.0.5-*.chrome.zip` below and unzip it to a permanent folder.
2. Go to `chrome://extensions`, enable **Developer mode** (top-right).
3. **Load unpacked** → select the unzipped folder.
4. Open a battle on [play.pokeathlon.com](https://play.pokeathlon.com) and hard-refresh (Ctrl+Shift+R).

**Firefox**
1. Download `showdex-v1.0.5-*.firefox.xpi` below.
2. Go to `about:debugging` → **This Firefox** → **Load Temporary Add-on** → pick the `.xpi`.

*Updating from an older build? Just reload the extension and hard-refresh the battle tab.*

## 📋 Known limitations (being honest)
- Manual Blade/Shield toggle only works when Aegislash is the **head** (as the body, it relies on the auto-switch).
- New Moon's damage is a close base-power approximation (a roll may be ~1 HP off the exact in-game chain).
- Preset depth varies by mod (Mariomon has the most; others lean on usage data).

## 💜 Thank you, testers
Huge thanks to everyone who battled, broke things, and sent reports — **Psychoplasm, Aevilok, I Like Porygon2, Jaykio, NiaDoesDumbStuff & Rowlet**. Special shoutout to **Jaykio** and **I Like Porygon2** for grinding out the Aegislash fusion Stance Change with me until the Blade/Shield stat swap was right. This release is yours as much as mine.

## 🗓️ Heads up on updates
I'm heading into college soon, so I'll be busy for a good chunk of the year. I'll keep this maintained, but expect updates **every few months** rather than constantly — whenever I get a window. Bug reports are still very welcome on the [Issues](https://github.com/HowToBasicMons/Athlon-Showdex/issues) page; I'll batch through them when I'm back at the keyboard.

## ❤️ Built on Showdex
Athlon Showdex is a fork of [doshidak/showdex](https://github.com/doshidak/showdex) by **Bot Keith & analogcam** — none of this exists without their work. Please go show them love: [Patreon](https://patreon.com/showdex) · [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN). Licensed under AGPL-3.0.
