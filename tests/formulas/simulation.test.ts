import { describe, expect, it } from 'vitest';
import { calculateClutchMultiplier, calculateFatiguePenalty, calculateHomeCourtAdvantage } from '../../src/formulas/simulation';

describe('simulation formulas', () => {
  it('home court formula', () => {
    expect(calculateHomeCourtAdvantage(50, 1)).toBe(4.5);
  });
  it('clutch and fatigue', () => {
    expect(calculateClutchMultiplier(70)).toBeCloseTo(1.1);
    expect(calculateFatiguePenalty(85).turnoverMultiplier).toBe(2);
  });
});
