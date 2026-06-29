import { describe, expect, it } from 'vitest';
import { safeStringify } from './safeStringify';

describe('safeStringify()', () => {
  it('stringifies plain values like JSON.stringify', () => {
    expect(safeStringify({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
    expect(safeStringify([1, 2, 3])).toBe('[1,2,3]');
    expect(safeStringify('hi')).toBe('"hi"');
  });

  it('does NOT throw on circular references (the live-battle Showdown object case)', () => {
    const circular: Record<string, unknown> = { name: 'battle' };
    circular.self = circular; // a cycle that plain JSON.stringify would throw on

    expect(() => safeStringify(circular)).not.toThrow();
    expect(safeStringify(circular)).toContain('[Circular]');
    expect(safeStringify(circular)).toContain('battle');
  });

  it('never returns undefined (falls back to String())', () => {
    expect(safeStringify(undefined)).toBe('undefined');
    expect(typeof safeStringify(() => {})).toBe('string');
  });
});
