import { describe, expect, it } from 'vitest';
import { applyTreeEffects } from '../../../src/systems/coaching/tree';

describe('coaching tree', () => {
  it('applies bonuses', () => {
    const fx = applyTreeEffects(1, { sameTree: true, mentorRegionMatch: true });
    expect(fx.regionInterestBonus).toBe(5);
  });
});
