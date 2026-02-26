import { describe, expect, it } from 'vitest';
import { TRANSFER_SITOUT_RULE, calculateTamperRisk, isImmediatelyEligibleByCount } from '../../src/formulas/portal';

describe('portal formulas', () => {
  it('keeps sitout rules configurable', () => {
    expect(TRANSFER_SITOUT_RULE.firstTime).toBe(false);
    expect(TRANSFER_SITOUT_RULE.secondTime).toBe(true);
    expect(isImmediatelyEligibleByCount(0)).toBe(true);
    expect(isImmediatelyEligibleByCount(1)).toBe(false);
  });

  it('calculates tamper risk from all factors', () => {
    expect(calculateTamperRisk({ coachEthics: 20, nilCollective: 90, playerValue: 90 })).toBeCloseTo(0.35);
  });
});
