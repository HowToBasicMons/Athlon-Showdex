/**
 * @file `main.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.0
 */

import {
  BootdexClassicAdapter,
  BootdexManager,
  BootdexPreactAdapter,
  CalcdexClassicBootstrapper,
  CalcdexPreactBootstrapper,
  HellodexClassicBootstrapper,
  HellodexPreactBootstrapper,
  HonkdexClassicBootstrapper,
  HonkdexPreactBootstrapper,
  NotedexClassicBootstrapper,
  NotedexPreactBootstrapper,
  TeamdexClassicBootstrapper,
  TeamdexPreactBootstrapper,
} from '@showdex/pages';
import { env } from '@showdex/utils/core';
import { logger, wtf } from '@showdex/utils/debug';
import { detectClassicHost, detectPreactHost } from '@showdex/utils/host';
import '@showdex/styles/global.scss';

const l = logger('@showdex/main');

l.debug('Starting', env('build-name', 'showdex'));

/**
 * Whether the host page currently exposes the Showdown client globals Showdex needs.
 *
 * * Classic (Backbone.js) client → `window.app.receive`.
 * * Preact client → `window.PS.startTime`.
 */
const hostReady = (host: typeof window): boolean => (
  typeof host?.Dex?.gen === 'number'
    && typeof host.Dex.forGen === 'function'
    && (
      typeof host.app?.receive === 'function'
        || typeof host.PS?.startTime === 'number'
    )
);

/**
 * Polls for the Showdown client globals before giving up.
 *
 * * The injected `main.js` can run (at `document_idle`) before the host client has finished
 *   initializing `window.app` / `window.Dex` / `window.PS` — especially on forks/mirrors
 *   (e.g. Pokéathlon) whose client scripts load on a different timeline than the official site.
 * * Rather than throwing immediately (which permanently disables Showdex for that page load),
 *   we wait up to `timeoutMs` for the globals to appear.
 */
const waitForHost = async (timeoutMs = 30000, intervalMs = 250): Promise<boolean> => {
  const start = Date.now();

  while (!hostReady(window) && (Date.now() - start) < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => { setTimeout(resolve, intervalMs); });
  }

  return hostReady(window);
};

// not sure when we'll run into this, but it's entirely possible now that standalone builds are a thing
if (window.__SHOWDEX_INIT) {
  l.error(
    'yo dawg I heard you wanted Showdex with your Showdex',
    '\n', '__SHOWDEX_INIT', window.__SHOWDEX_INIT,
    '\n', '__SHOWDEX_HOST', window.__SHOWDEX_HOST,
    '\n', 'BUILD_NAME', env('build-name'),
  );

  throw new Error('Another Showdex tried to load despite one already being loaded.');
}

// basically using this as a Showdex init mutex lock lol
window.__SHOWDEX_INIT = env('build-name', 'showdex');

// note: don't inline await, otherwise, there'll be a race condition with the login
// (also makes the Hellodex not appear immediately when Showdown first opens)
void (async () => {
  // first gotta make sure we're in Showdown (polling since the host client may still be loading)
  const ready = await waitForHost();

  if (!ready) {
    l.error(
      'main timed out waiting for the Showdown client globals, or we\'re not in Showdown...',
      '\n', 'window.Dex', '(typeof)', wtf(window?.Dex), window?.Dex,
      '\n', 'window.app', '(typeof)', wtf(window?.app), window?.app,
      '\n', 'window.PS', '(typeof)', wtf(window?.PS), window?.PS,
    );

    // release the mutex so a subsequent (re)injection can try again
    window.__SHOWDEX_INIT = undefined;

    throw new Error('Showdex attempted to start in an unsupported website.');
  }

  // determine if we're in that new new preact mode or nahhhhh
  // ("new" at the time of me writing this on 2025/08/08, anyway)
  window.__SHOWDEX_HOST = (detectPreactHost(window) && 'preact')
    || (detectClassicHost(window) && 'classic')
    || null;

  switch (window.__SHOWDEX_HOST) {
    case 'preact': {
      l.silly(
        'welcome to Showdex for pre\'s react edition !!!',
        '\n', 'PS', '(typeof)', wtf(window.PS), '(start)', window.PS.startTime,
        '\n', '__SHOWDEX_HOST', window.__SHOWDEX_HOST,
        '\n', '__SHOWDEX_INIT', window.__SHOWDEX_INIT,
        '\n', '(note: no relation to @pre ... that was for the punies hehe)', // fun fact: puny + react = preact (punny huh)
      );

      BootdexManager.register('calcdex', CalcdexPreactBootstrapper);
      BootdexManager.register('hellodex', HellodexPreactBootstrapper);
      BootdexManager.register('honkdex', HonkdexPreactBootstrapper);
      BootdexManager.register('notedex', NotedexPreactBootstrapper);

      await BootdexPreactAdapter.run();
      new CalcdexPreactBootstrapper().run();
      new TeamdexPreactBootstrapper().run();
      new HellodexPreactBootstrapper().run();
      new HonkdexPreactBootstrapper().run();
      new NotedexPreactBootstrapper().run();

      break;
    }

    case 'classic': {
      BootdexManager.register('calcdex', CalcdexClassicBootstrapper);
      BootdexManager.register('hellodex', HellodexClassicBootstrapper);
      BootdexManager.register('honkdex', HonkdexClassicBootstrapper);
      BootdexManager.register('notedex', NotedexClassicBootstrapper);
      BootdexClassicAdapter.receiverFactory = (roomId) => () => void new CalcdexClassicBootstrapper(roomId).run();

      await BootdexClassicAdapter.run();
      new TeamdexClassicBootstrapper().run();
      new HellodexClassicBootstrapper().run();
      new HonkdexClassicBootstrapper().run();
      new NotedexClassicBootstrapper().run();

      break;
    }

    default: {
      l.error(
        'Couldn\'t determine what __SHOWDEX_HOST we\'re in rn o_O',
        '\n', '__SHOWDEX_HOST', window.__SHOWDEX_HOST,
        '\n', '__SHOWDEX_INIT', window.__SHOWDEX_INIT,
      );

      throw new Error('Showdex attempted to run in an unsupported Showdown host.');
    }
  }

  l.success(window.__SHOWDEX_INIT, 'for', window.__SHOWDEX_HOST, 'initialized!');
})();
