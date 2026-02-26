import { describe, expect, it } from 'vitest';
import { calculateSOS, classifyQuad } from '../../src/formulas/rankings';

describe('rankings formulas', () => {
  it('calculates sos', () => {
    expect(calculateSOS(70, 55, 60)).toBeCloseTo((70 * 0.6) + (55 * 0.25) + (60 * 0.15));
  });

  it('classifies quads by location', () => {
    expect(classifyQuad(20, 'HOME')).toBe('Q1');
    expect(classifyQuad(90, 'AWAY')).toBe('Q2');
  });
});
