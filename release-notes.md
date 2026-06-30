# 🐢 Athlon Showdex v1.0.4

Accuracy pass using Pokéathlon's own client source — fusions now match the server, plus Stance Change support and Mariomon sample sets.

## 🛠️ Fixes
- Fused typing no longer reverts to the head's typing on switch-out.
- **Stance Change works on fusions** now (Aegislash Shield ↔ Blade).
- Sprite fallback no longer shows a wrong-format sprite.
- Dandelight applies to the correct forme.

## ✨ Improvements
- **Authoritative fusion typing** — pulled directly from the Infinite Fusion mod data, so it matches the server exactly.
- **Expert Moves** — fusions now get their signature tutor moves (Fiery Dance, Light of Ruin, Fleur Cannon, Thousand Arrows, …) when they qualify.
- **Mariomon sample sets** — community teams added as named, selectable presets in non-random Mariomon formats.

## ⚡ Performance
- Cached the type-chart resolver (was rebuilt every calc) and the Pokéathlon usage download.

## 📦 Install (beta)
1. Download the `.zip` below, unzip to a permanent folder.
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick the folder.
3. Open a battle on [play.pokeathlon.com](https://play.pokeathlon.com).

## ❤️ Built on Showdex
A fork of [doshidak/showdex](https://github.com/doshidak/showdex) by **Bot Keith & analogcam** — please support them: [Patreon](https://patreon.com/showdex) · [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN).

Thanks to beta testers **Aevilok, Psychoplasm, Jaykio, Marss** 💜
