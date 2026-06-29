<p align="center">
  <img alt="athlon-showdex-icon" width="200px" src="./src/assets/favicons/showdex-1024.png">
</p>

<h1 align="center">
  Athlon Showdex
</h1>

<p align="center">
  A fork of <a href="https://github.com/doshidak/showdex"><code>doshidak/showdex</code></a>, adapted for
  <a href="https://play.pokeathlon.com"><strong>Pokéathlon</strong></a> &mdash; the Infinite Fusion + fangame
  Pokémon&nbsp;Showdown server.
</p>

<p align="center">
  <a href="https://github.com/HowToBasicMons/Athlon-Showdex/releases">Releases</a> ·
  <a href="https://play.pokeathlon.com">Pokéathlon</a> ·
  <a href="https://discord.gg/vsEN6mzuNj">Pokéathlon Discord</a>
</p>

<br>

## What is this?

**Athlon Showdex** is the in-battle damage calculator (Calcdex) from [Showdex](https://github.com/doshidak/showdex),
re-tuned so it actually understands Pokéathlon's mechanics. It injects **only** on
[`play.pokeathlon.com`](https://play.pokeathlon.com) and reads straight from the live client, so it stays in sync with
the server's custom data.

## What's different from upstream Showdex

- **Infinite Fusion support** — fused base stats (head/body bias), fused typing, merged ability & move pools, and the
  proper fusion name (e.g. *Jilucha*, *Sylnite*) in the header.
- **Fusion sprites** — pulls Pokéathlon's custom fusion art, with fallbacks to the head's fangame/vanilla sprite (so
  Chaos fusions & artless pairs still render).
- **Custom types** — Sound, Light, Cosmic, Nuclear & Crystal are wired through typing, move types, the type chart and
  damage effectiveness.
- **Custom-mod formats** — Soulstones, Insurgence, Uranium, Infinity, Mariomon & Chaos are recognized; their custom
  rosters/moves/items/types resolve in the calc.
- **Pokéathlon presets** — opponent sets are predicted from Pokéathlon's own usage data (incl. fusion sets, matched by
  exact head+body), plus a bundled **Mariomon Random Battle** set dump.
- **Custom items** — selectable across the board, with stat-multiplier effects (Goomba Boots, Sturdy Shell, the Orion
  orbs, Anchor, Assault/Muscle Armor, Wise Vest, …) applied to both the shown stats and the damage calc.
- **Pokéathlon branding** — Electrode-Mega mascot/icon, Athlon Showdex naming, and Pokéathlon-only injection.

## Install (beta)

This is currently distributed to beta testers as an unpacked Chrome/Edge extension:

1. Download the latest `.zip` from [Releases](https://github.com/HowToBasicMons/Athlon-Showdex/releases) and unzip it
   to a permanent folder.
2. Go to `chrome://extensions`, enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the unzipped folder.
4. Open [`play.pokeathlon.com`](https://play.pokeathlon.com) and start or spectate a battle — the Calcdex appears.

On updates: hit the **reload** icon on the extension card, then refresh the battle tab.

## Credits

- **Maintained by** [HowToBasicMons](https://github.com/HowToBasicMons).
- **Beta testing** — Aevilok, Psychoplasm, Jaykio, Marss (+ 2 more, coming soon). Thank you for the bug reports and
  matchups. 💜

### Built on Showdex — go show the original devs some love

Athlon Showdex exists only because of the incredible work by **Bot Keith** & **analogcam** on
[Showdex](https://github.com/doshidak/showdex). If you enjoy this, please support the people who built the foundation:

- ❤️ Support on [Patreon](https://patreon.com/showdex) or via [PayPal](https://paypal.com/donate/?hosted_button_id=ZUYJAGAVX6MBN)
- 💬 The original [Showdex Smogon thread](https://smogon.com/forums/threads/showdex-an-auto-updating-damage-calculator-built-into-showdown.3707265) and [Discord](https://discord.gg/2PXVGGCkm2)
- ⭐ Star the [upstream repo](https://github.com/doshidak/showdex)

## License

Licensed under **AGPL-3.0**, the same as upstream Showdex — see [`LICENSE`](./LICENSE). As a network-facing fork, the
full source is published here. All original Showdex copyright and attribution is retained.
