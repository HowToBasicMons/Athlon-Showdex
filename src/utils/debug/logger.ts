import pino from 'pino/browser';
import { LoggerLevelValues, devOnlyLevels, pinoCustomLevels } from './levelMap';
import { teledex } from './teledex';

export type LoggerLevel =
  | 'silly'
  | 'debug'
  | 'verbose'
  | 'info'
  | 'success'
  | 'warn'
  | 'error';

export type LoggerLogFunction = (...data: unknown[]) => void;
export type LoggerLogFactory = (scope?: string, level?: LoggerLevel) => LoggerLogFunction;

export interface LoggerLevelFunctions extends Record<LoggerLevel, LoggerLogFunction> {
  scope?: string;
}

export type LoggerLevelFactory = (scope?: string) => LoggerLevelFunctions;
export type LoggerInstance = Omit<LoggerLevelFunctions, 'scope'> & LoggerLevelFactory;

const __DEV__ = process.env.NODE_ENV === 'development';

const ALL_LEVELS: LoggerLevel[] = [
  'silly',
  'debug',
  'verbose',
  'info',
  'success',
  'warn',
  'error',
];

/**
 * Single pino instance acting as the level registry / serializer.
 *
 * We don't let pino write to the console itself (`write` is a no-op) -- the facade
 * fans out to `console` (under the existing `__DEV__`/devOnly gating) & `teledex.capture()`
 * manually below, so the console output & the in-memory trail stay perfectly in sync.
 *
 * @since 1.3.0
 */
const pinoLogger = pino({
  level: 'silly',
  customLevels: pinoCustomLevels,
  browser: {
    asObject: true,
    write: () => {},
  },
});

/** Console-printable iff it's not a dev-only level, or we're in a dev build. */
const consolePrintable = (level: LoggerLevel): boolean => (
  !devOnlyLevels.includes(level) || __DEV__
);

const consoleMethod = (level: LoggerLevel): 'log' | 'info' | 'warn' | 'error' => {
  switch (level) {
    case 'warn': {
      return 'warn';
    }

    case 'error': {
      return 'error';
    }

    case 'verbose':
    case 'info': {
      return 'info';
    }

    default: {
      return 'log';
    }
  }
};

const emit = (scope: string, level: LoggerLevel, data: unknown[]): void => {
  try {
    const printable = consolePrintable(level);
    const capturable = teledex.shouldCapture(level);

    // prod's dev-only firehose (debug/verbose/silly logs in syncBattle + the update reducers): nothing
    // prints & nothing gets captured, so bail before the pino object-build, the `...data` spread, & capture()
    if (!printable && !capturable) {
      return;
    }

    // route through pino so the level is registered/serialized (write is a no-op)
    const pinoLevel = level in pinoLogger ? level : 'info';
    (pinoLogger as Record<string, LoggerLogFunction>)[pinoLevel]?.({ scope }, ...data);

    // 1) console output (existing `__DEV__`/devOnly gating)
    if (printable) {
      const method = consoleMethod(level);
      // eslint-disable-next-line no-console
      (console[method] || console.log)(`[${scope || '?'}]`, `(${level})`, ...data);
    }

    // 2) teledex sink -- synchronous so the in-memory trail is complete at crash time
    // (further gating, incl. dev-only handling, lives inside teledex.capture())
    teledex.capture(level, scope, data);
  } catch { /* logging must never break the app */ }
};

const buildFns = (scope = ''): LoggerLevelFunctions => ALL_LEVELS.reduce((acc, level) => {
  acc[level] = (...data: unknown[]) => emit(scope, level, data);

  return acc;
}, { scope } as LoggerLevelFunctions);

export const logger = ((scope = '') => buildFns(scope)) as LoggerInstance;

ALL_LEVELS.forEach((level) => {
  (logger as unknown as Record<string, LoggerLogFunction>)[level] = (
    ...data: unknown[]
  ) => emit('', level, data);
});

export { LoggerLevelValues };
