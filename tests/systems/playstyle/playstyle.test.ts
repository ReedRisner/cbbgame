import { describe, expect, it } from 'vitest';
import { calculateMoraleDelta } from '../../../src/formulas/playstyle';

describe('playstyle morale', () => {
  it('calculates morale', () => {
    expect(calculateMoraleDelta(45, -1, 1, 1, 1)).toBeLessThan(2);
  });
});
