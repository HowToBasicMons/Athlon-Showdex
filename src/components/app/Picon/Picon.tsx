import * as React from 'react';
import cx from 'classnames';
import { type ItemName } from '@smogon/calc';
import { type CalcdexPokemon } from '@showdex/interfaces/calc';
import { getFusionSpriteUrl, getPokemonSpriteUrl } from '@showdex/utils/dex';
import { ItemIcon } from '../ItemIcon';
import styles from './Picon.module.scss';

export interface PiconProps {
  className?: string;
  style?: React.CSSProperties;
  pokemon?: Partial<Showdown.Pokemon> | Partial<CalcdexPokemon> | string;
  facingLeft?: boolean;
}

/** Extracts just the `background:` value from the client's `Dex.getPokemonIcon()` CSS string. */
const piconBackground = (
  pokemon: Partial<Showdown.Pokemon> | Partial<CalcdexPokemon> | string,
  facingLeft?: boolean,
): string => Dex?.getPokemonIcon((pokemon as Showdown.Pokemon) || 'pokeball-none', facingLeft)
  ?.split(';')[0]
  ?.replace(/^background:/, '');

export const Picon = ({
  className,
  style,
  pokemon,
  facingLeft,
}: PiconProps): React.JSX.Element => {
  const item = (typeof pokemon !== 'string' && pokemon?.item as ItemName) || null;

  // base layer: the icon spritesheet background (kept as the fallback if the sprite image fails)
  const background = piconBackground(pokemon, facingLeft);

  // Pokéathlon: render an actual sprite image on top of the icon background, since the icon
  // spritesheet doesn't reliably render in the injected panel context.
  // - Fusions (Head `speciesForme` + Body `fusion`) -> the dedicated fuse art.
  // - Everything else -> the species' gen-5 sprite.
  // If the sprite 404s, it's hidden & the icon background shows through; for fusions, we then
  // fall back to a half-&-half (Head left / Body right) icon so head vs body stays clear.
  const headForme = typeof pokemon !== 'string' ? pokemon?.speciesForme : null;
  const bodyForme = typeof pokemon !== 'string' ? (pokemon as Partial<CalcdexPokemon>)?.fusion : null;
  const isFusion = !!headForme && !!bodyForme && headForme !== bodyForme;

  const headBackground = isFusion ? piconBackground(headForme, facingLeft) : null;
  const bodyBackground = isFusion ? piconBackground(bodyForme, facingLeft) : null;

  // Pokéathlon sprite chain (tried in order, advancing on each <img> error):
  //   1. the custom Head+Body fusion art (play.pokeathlon.com/sprites/fusion-sprites)
  //   2. the Head species' sprite via the live client resolver (format-correct: handles fangame/
  //      Chaos/etc. for the *current* format)
  // We intentionally do NOT add a vanilla Showdown gen-5 guess as a fallback — for custom species
  // that mis-resolves to a *different format's* sprite. If both fail on a fusion, we drop to the
  // half-&-half Head/Body icons instead of showing a wrong-format sprite.
  const spriteCandidates = React.useMemo<string[]>(() => {
    if (!headForme) {
      return [];
    }

    const list = isFusion
      ? [getFusionSpriteUrl(headForme, bodyForme), getPokemonSpriteUrl(headForme)]
      : [getPokemonSpriteUrl(headForme)];

    // dedupe & drop nulls
    return list.filter((url, i, arr) => !!url && arr.indexOf(url) === i);
  }, [bodyForme, headForme, isFusion]);

  const [candidateIndex, setCandidateIndex] = React.useState(0);

  React.useEffect(() => {
    setCandidateIndex(0);
  }, [spriteCandidates]);

  const spriteUrl = spriteCandidates[candidateIndex] || null;
  const showSprite = !!spriteUrl;
  const showHalfAndHalf = isFusion && !spriteUrl && !!headBackground && !!bodyBackground;

  return (
    <div
      className={cx(styles.container, className)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
        ...(!!background && { background }),
      }}
    >
      {
        showSprite &&
        <img
          key={spriteUrl}
          src={spriteUrl}
          alt={isFusion ? `${headForme} / ${bodyForme}` : headForme}
          title={isFusion ? `Head: ${headForme} • Body: ${bodyForme}` : undefined}
          draggable={false}
          onError={() => setCandidateIndex((i) => i + 1)}
          decoding="async"
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />
      }

      {
        showHalfAndHalf && (
          <>
            <div
              title={`Head: ${headForme}`}
              style={{
                position: 'absolute',
                inset: 0,
                background: headBackground,
                clipPath: 'inset(0 50% 0 0)',
                pointerEvents: 'none',
              }}
            />
            <div
              title={`Body: ${bodyForme}`}
              style={{
                position: 'absolute',
                inset: 0,
                background: bodyBackground,
                clipPath: 'inset(0 0 0 50%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 'calc(50% - 0.5px)',
                width: 1,
                background: 'rgba(0, 0, 0, 0.35)',
                pointerEvents: 'none',
              }}
            />
          </>
        )
      }

      {
        !!item &&
        <ItemIcon
          className={styles.itemIcon}
          item={item}
        />
      }
    </div>
  );
};
