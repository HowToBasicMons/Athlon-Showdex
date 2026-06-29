// src/utils/debug/teledex/teledex.ts
import { add, sub } from 'date-fns';
import { env } from '@showdex/utils/core/getEnv';
import { type LoggerLevel } from '../logger';
import { devOnlyLevels } from '../levelMap';
import { TeledexBuffer } from './teledexBuffer';
import { type TeledexRecord, buildTeledexRecord, teledexSession } from './teledexRecord';
import { resolveTeledexConfig } from './teledexConfig';

declare const __DEV__: boolean;

// Lazy init: teledex.ts is re-exported from @showdex/utils/debug (the debug barrel), which is
// transitively imported by @showdex/utils/core utilities (runtimeFetch, safeJsonParse → debug →
// this file).  teledexConfig.ts also imports env() from @showdex/utils/core, so calling
// resolveTeledexConfig() at module-evaluation time would hit a circular TDZ.
// Storage helpers (pruneTeledexDb etc.) likewise import @showdex/utils/debug, so they use
// dynamic import()s inside the async/callback functions that actually need them.
let _config: ReturnType<typeof resolveTeledexConfig> | undefined;
let _buffer: TeledexBuffer | undefined;

const cfg = () => {
  if (!_config) { _config = resolveTeledexConfig(); }
  return _config;
};
const buf = () => {
  if (!_buffer) { _buffer = new TeledexBuffer(cfg().maxRecords); }
  return _buffer;
};

const subscribers = new Set<() => void>();

let developerMode = false;
let pending: TeledexRecord[] = [];
let flushTimer: ReturnType<typeof setTimeout> = null;

const notify = () => subscribers.forEach((fn) => { try { fn(); } catch { /* noop */ } });

const mirrorSoon = () => {
  if (!developerMode || flushTimer) {
    return;
  }

  flushTimer = setTimeout(() => {
    flushTimer = null;
    const batch = pending;
    pending = [];

    void (async () => {
      try {
        const [{ writeTeledexDb }, { pruneTeledexDb }] = await Promise.all([
          import('@showdex/utils/storage/writeTeledexDb'),
          import('@showdex/utils/storage/pruneTeledexDb'),
        ]);
        await writeTeledexDb(batch);
        const before = sub(new Date(), cfg().maxAge).valueOf();
        await pruneTeledexDb({ before, max: cfg().maxRecords });
      } catch { /* noop */ }
    })();
  }, 1000);
};

export const teledex = {
  shouldCapture(level: LoggerLevel): boolean {
    return cfg().enabled && (!devOnlyLevels.includes(level) || __DEV__ || developerMode);
  },

  capture(level: LoggerLevel, scope: string, args: unknown[]): void {
    try {
      if (!this.shouldCapture(level)) {
        return;
      }

      const record = buildTeledexRecord(level, scope, args);
      buf().push(record);

      if (developerMode) {
        pending.push(record);
        mirrorSoon();
      }

      notify();
    } catch {
      // logging must never break the app
    }
  },

  setDeveloperMode(on: boolean): void {
    developerMode = !!on;
  },

  tail(n?: number): TeledexRecord[] { return buf().tail(n); },
  filter(pred: Parameters<TeledexBuffer['filter']>[0]): TeledexRecord[] { return buf().filter(pred); },
  all(): TeledexRecord[] { return buf().all(); },

  subscribe(fn: () => void): () => void {
    subscribers.add(fn);
    return () => void subscribers.delete(fn);
  },

  async flush(opts?: { to?: 'file' | 'clipboard'; tail?: number }): Promise<void> {
    const records = developerMode
      ? await (await import('@showdex/utils/storage/readTeledexDb')).readTeledexDb()
      : buf().all();
    const tail = opts?.tail ? records.slice(-opts.tail) : records;
    const payload = {
      build: env('build-name'),
      session: teledexSession,
      created: new Date().toISOString(),
      count: tail.length,
      records: tail,
    };

    // lazy import: @showdex/utils/core/dumpPayload reaches the clipboard chain, which
    // transitively pulls the debug barrel (→ logger) -- importing it eagerly here would
    // re-introduce the module-init cycle, so we only pull it inside this async fn.
    const { dumpPayloadToClipboard, dumpPayloadToFile } = await import('@showdex/utils/core/dumpPayload');

    if (opts?.to === 'clipboard') {
      return void await dumpPayloadToClipboard(payload);
    }

    dumpPayloadToFile(payload, [
      env('build-name'),
      'teledex',
      `t${Date.now().toString(16).toUpperCase()}`,
    ]);
  },

  async clear(): Promise<void> {
    buf().clear();
    pending = [];
    notify();
    if (developerMode) {
      try {
        const { pruneTeledexDb } = await import('@showdex/utils/storage/pruneTeledexDb');
        await pruneTeledexDb({ before: add(new Date(), { years: 100 }).valueOf() });
      } catch { /* noop */ }
    }
  },
};
