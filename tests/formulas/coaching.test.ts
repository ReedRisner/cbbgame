import { describe, expect, it } from 'vitest';
import { calculateAssistantBonus, calculateBuyout, calculateFiringProbability, calculateHotSeatScore } from '../../src/formulas/coaching';

describe('coaching formulas', () => {
  it('calculates hot seat', () => {
    expect(calculateHotSeatScore({ expectedWins: 20, actualWins: 14, tourneyDisappointment: 0, scandalPenalty: 1, fanPressure: 3, consecutiveUnderperformYears: 1 })).toBe(18);
  });
  it('calculates firing probability', () => {
    expect(calculateFiringProbability(20, 8)).toBeGreaterThan(0.9);
  });
  it('buyout and assistant', () => {
    expect(calculateBuyout(1_000_000, 3)).toBe(2_100_000);
    expect(calculateAssistantBonus(90, 'OC')).toBeLessThanOrEqual(8);
  });
});
