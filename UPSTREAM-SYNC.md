# Upstream Sync Plan (→ v1.0.6)

How to pull in **doshidak/showdex** updates without breaking the Pokéathlon work. Written for
v1.0.5; revisit when there's time (no rush — v1.0.5 is stable & shipped).

## Where we stand

- **Fork base:** upstream **v1.3.0** (`ac314a7`).
- **Upstream now:** **v1.4.0**, **85 commits** ahead of our base.
- **Our fork:** ~70 files changed on top of v1.3.0 (the Pokéathlon layer).
- **Conflict surface:** only **14 files** that *both* we and upstream changed (listed below). Everything
  else merges clean.

Refresh these numbers anytime:

```bash
git fetch upstream
BASE=$(git merge-base master upstream/master)
git rev-list --count "$BASE..upstream/master"   # upstream commits ahead
git diff --name-only "$BASE" master  > ours.txt
git diff --name-only "$BASE" upstream/master > theirs.txt
# overlap = the merge conflict surface
```

## Notable upstream features in v1.4.0 (worth getting)

- **Teledex / Devdex** — live log viewer + "Dump Bug Report" context item (great for our beta testers).
- **Preset/Randoms fixes** — don't gate Randoms guessing on revealed item; Mega-stone gating; mega/primal
  forme folding; moveless-mon auto-guess.
- **Perf** — teledex ring buffer, throttled re-renders, hot-path trims.
- **Mega toggle button** in PokeMoves (`49333c6`).
- **`@smogon/calc` patch bump** to `9f67278` (`724df56`) — ⚠️ see caution below.
- Champions formats + 2026 usage bundles (mostly irrelevant to Pokéathlon, but harmless).

## ⚠️ The one real risk: the `@smogon/calc` patch

Our damage accuracy depends on the **`ShowdexCalcMods`** baked into the patched `@smogon/calc@0.11.0`.
Upstream moved the patch to `9f67278`. **Do not** blindly take their patch — diff it against ours and
re-apply our mods, or keep our patched version and only cherry-pick non-calc upstream changes. Verify a
few known matchups after.

## Recommended workflow

1. Branch off master — **never merge into master directly**:
   ```bash
   git fetch upstream
   git switch -c chore/upstream-v1.4.0 master
   git merge upstream/master
   ```
2. Resolve the 14 overlap files (notes below). For the trivial ones, usually keep **ours**.
3. `pnpm install` (lockfile will need regen), `pnpm typecheck`, `pnpm test` (fusion engine must stay green).
4. `pnpm build:chrome:fast` + a live battle smoke test on play.pokeathlon.com (fusion stats, typing,
   Stance Change, presets, sprites).
5. Only then fast-forward master and cut **v1.0.6**.

## The 14 overlap files + resolution notes

| File | Ours | Resolution |
| --- | --- | --- |
| `pnpm-lock.yaml` | deps (vitest) | regenerate via `pnpm install` |
| `package.json` | name/version/scripts/repo | keep ours; merge any new upstream scripts/deps |
| `.env` | fork URLs + `PACKAGE_VERSION_SUFFIX` | keep ours; add any new upstream keys |
| `README.md` | full rebrand | keep ours |
| `src/utils/dex/index.ts` | barrel exports | take both (additive) |
| `src/utils/presets/index.ts` | barrel exports | take both (additive) |
| `src/assets/i18n/en/hellodex.json` | rebrand strings | keep our strings; add new upstream keys |
| `src/main.ts` | Pokéathlon-only injection restriction | keep our host gating; layer upstream init changes |
| `src/pages/Hellodex/Hellodex.tsx` | rebrand (mascot, credits, version) | keep our branding; take upstream structural/feature changes |
| `src/consts/dex/formats.ts` | Pokéathlon format labels/regex | keep ours; add upstream's new (Champions) formats |
| `src/components/calc/PokeInfo/PokeInfo.tsx` | fusion name display, forme switcher use | careful merge — preserve `getFusionName`/fusion sprite props |
| `src/utils/presets/useBattlePresets.ts` | skip Smogon presets for Pokéathlon mods | keep our mod-skip guard; take upstream preset-guess fixes |
| `src/utils/calc/calcSmogonMatchup.ts` | pass `field` into `createSmogonPokemon` | keep our extra arg; layer upstream calc changes |
| `src/utils/calc/createSmogonPokemon.ts` | fusion baseStats, Eviolite NFE, custom item/ability mods | **most care** — re-apply all our Pokéathlon blocks on top of upstream |

## Files only WE changed (merge clean, but re-verify after upstream churn)

The Pokéathlon engine — `fuseSpecies.ts`, `sanitizePokemon.ts`, `syncPokemon.ts`,
`calcPokemonFinalStats.ts`, `createSmogonMove.ts`, `getFusionExpertMoves.ts`, `getTypesDex.ts`,
`getPokemonSpriteUrl.ts`, `weather.ts`, `pokeathlonItems.ts`, `pokeathlonAbilities.ts`,
`types.ts`, the preset hooks, sprites/icons, etc. These won't conflict, but upstream may have changed
APIs they call — typecheck will catch it.
