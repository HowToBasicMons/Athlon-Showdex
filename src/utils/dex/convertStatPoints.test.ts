import { describe, expect, it } from 'vitest';
import { evToStatPoint, statPointToEv } from './convertStatPoints';

describe('evToStatPoint()', () => {
  it('maps clean EVs to integer points (1st pt = 4 EVs, rest = 8)', () => {
    expect(evToStatPoint(0)).toBe(0);
    expect(evToStatPoint(4)).toBe(1);
    expect(evToStatPoint(132)).toBe(17);
    expect(evToStatPoint(116)).toBe(15);
    expect(evToStatPoint(252)).toBe(32);
  });

  it('yields fractional ("floating") points for EVs not of the form 8N-4', () => {
    expect(evToStatPoint(80)).toBe(10.5);
    expect(evToStatPoint(8)).toBe(1.5);
  });

  it('clamps to 32 & floors negatives to 0', () => {
    expect(evToStatPoint(508)).toBe(32);
    expect(evToStatPoint(-4)).toBe(0);
  });
});

describe('statPointToEv()', () => {
  it('inverts evToStatPoint for integer points', () => {
    expect(statPointToEv(0)).toBe(0);
    expect(statPointToEv(1)).toBe(4);
    expect(statPointToEv(17)).toBe(132);
    expect(statPointToEv(32)).toBe(252);
  });

  it('inverts fractional points', () => {
    expect(statPointToEv(10.5)).toBe(80);
  });
});
