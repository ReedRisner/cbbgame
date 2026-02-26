import { describe, expect, it } from 'vitest';
import { calculatePreseasonScore } from '../../src/formulas/postseason';

describe('postseason formulas', () => {
  it('calculates preseason score', () => {
    expect(calculatePreseasonScore(80, 75, 60, 50)).toBeCloseTo((80 * 0.35) + (75 * 0.3) + (60 * 0.2) + (50 * 0.15));
  });
});
