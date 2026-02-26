import { describe, expect, it } from 'vitest';
import { parseRivalTeamId } from '../../../src/systems/schedule/rivalry';

describe('rivalry helpers', () => {
  it('parses valid ids', () => {
    expect(parseRivalTeamId('12')).toBe(12);
    expect(parseRivalTeamId(5)).toBe(5);
  });

  it('rejects invalid ids', () => {
    expect(parseRivalTeamId(undefined)).toBeNull();
    expect(parseRivalTeamId('x')).toBeNull();
    expect(parseRivalTeamId(0)).toBeNull();
  });
});
