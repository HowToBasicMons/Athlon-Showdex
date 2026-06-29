/**
 * Vitest setup: load the repo `.env` into `process.env` so env-backed utils (e.g. `getDefaultSpreadValue()`,
 * which reads `CALCDEX_*` defaults via `env()`) resolve real config values under test.
 *
 * * Runs before each test file's imports, so `getEnv.ts` captures the loaded values.
 *
 * @since 1.4.0
 */
import 'dotenv/config';

// Provide a minimal window shim so modules that reference `window` during module initialization
// (e.g. showdexSlice's getAuthUsername/getColorScheme calls) don't throw `ReferenceError: window
// is not defined` in a node test environment.  detectClassicHost/detectPreactHost both use safe
// optional-chaining, so an empty object is sufficient — they'll simply return null/'light'.
if (typeof globalThis.window === 'undefined') {
  (globalThis as Record<string, unknown>).window = {};
}
