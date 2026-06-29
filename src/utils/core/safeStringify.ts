/**
 * Returns a `JSON.stringify` replacer that drops circular references (replacing them with `'[Circular]'`).
 *
 * A live battle logs Showdown objects (the `battle`/`room`/`pokemon` graph) that contain circular refs, so a
 * plain `JSON.stringify` on a captured arg throws `TypeError: Converting circular structure to JSON` — which
 * would crash the Devdex row render & the teledex flush. Each call returns a fresh replacer (its own `WeakSet`)
 * so it's safe to reuse.
 *
 * @since 1.4.3
 */
export const circularReplacer = (): (this: unknown, key: string, value: unknown) => unknown => {
  const seen = new WeakSet<object>();

  return (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }

      seen.add(value);
    }

    return value;
  };
};

/**
 * Circular-safe `JSON.stringify` — never throws.
 *
 * Drops circular references (via `circularReplacer()`) and falls back to `String(value)` (then a fixed marker)
 * if serialization still fails, so logging/flush paths can stringify arbitrary captured args safely.
 *
 * @since 1.4.3
 */
export const safeStringify = (value: unknown, space?: string | number): string => {
  // last-resort fallback: '[object Object]' etc. is fine here (better than throwing on un-JSON-able args)
  /* eslint-disable @typescript-eslint/no-base-to-string */
  try {
    return JSON.stringify(value, circularReplacer(), space) ?? String(value);
  } catch {
    try {
      return String(value);
    } catch {
      return '[Unserializable]';
    }
  }
  /* eslint-enable @typescript-eslint/no-base-to-string */
};
