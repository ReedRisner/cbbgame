import { describe, expect, it } from 'vitest';
import { calculateDesiredSOS, calculateRivalryIntensityDelta } from '../../src/formulas/schedule';

describe('schedule formulas', () => {
  it('computes desired sos', () => {
    expect(calculateDesiredSOS(80, 70, 60)).toBeCloseTo((80 * 0.4) + (70 * 0.3) + (60 * 0.3));
  });

  it('computes rivalry intensity delta', () => {
    expect(calculateRivalryIntensityDelta(2, true, 1)).toBeCloseTo((2 * 0.4) + (3 * 0.3) + (1 * 0.3));
  });
});
