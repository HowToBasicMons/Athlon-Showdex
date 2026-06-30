# 🐢 Athlon Showdex v1.0.4-hotfix.1

A focused patch fixing Aegislash's **Stance Change** on fusions so it matches Pokémon Infinite Fusion, plus an Eviolite fix for fused NFE bodies.

## 🛠️ Fixes
- **Stance Change rebuilt for fusions.** Blade forme now keeps the **Shield** fusion and **swaps the fused base Atk↔Def and Sp.Atk↔Sp.Def** — the actual PIF mechanic. (It was wrongly re-fusing with Aegislash-Blade's own base stats before.)
- **Blade forme sticks.** It no longer reverts to Shield on every battle update, and the manual Shield ⟷ Blade toggle now persists. Works whether Aegislash is the **head or body**.
- **Still a fusion in Blade forme** — keeps the correct fusion **name and sprite** instead of showing a plain Aegislash-Blade.
- **Eviolite** now applies when **either** half is not-fully-evolved (e.g. fully-evolved head + NFE body like Doublade), in both the calc and the stat display.

## 📦 Install (beta)
1. Download the `.zip` below, unzip to a permanent folder.
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick the folder (or hit **Reload** if you already have it).
3. Open a battle on [play.pokeathlon.com](https://play.pokeathlon.com) and hard-refresh (Ctrl+Shift+R).

## ❤️ Built on Showdex
A fork of [doshidak/showdex](https://github.com/doshidak/showdex) by **Bot Keith & analogcam** — please support them: [Patreon](https://patreon.com/showdex) · [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN).

Thanks to beta testers **Aevilok, Psychoplasm, Jaykio, Marss** 💜
