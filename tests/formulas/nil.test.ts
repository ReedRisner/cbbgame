import { describe, expect, it } from 'vitest';
import { calculateAnnualNILBudgetFormula, calculateNILRecruitingImpact, enforceNILSoftCapFormula } from '../../src/formulas/nil';

describe('nil formulas', () => {
  it('produces large spread between top and bottom budgets', () => {
    const top = calculateAnnualNILBudgetFormula({ boosterBudget: 80, mediaMarket: 98, currentPrestige: 98, fanInterest: 98, donorMomentum: 0 });
    const bottom = calculateAnnualNILBudgetFormula({ boosterBudget: 2, mediaMarket: 10, currentPrestige: 10, fanInterest: 15, donorMomentum: 0 });
    expect(top / bottom).toBeGreaterThan(150);
  });

  it('enforces player soft cap', () => {
    const cap = enforceNILSoftCapFormula(1_000_000, 300_000);
    expect(cap.allowed).toBe(false);
    expect(cap.maxAllowed).toBe(250_000);
  });

  it('has diminishing returns on high offers', () => {
    const nearMedian = calculateNILRecruitingImpact(100_000, 100_000);
    const huge = calculateNILRecruitingImpact(1_000_000, 100_000);
    expect(huge - nearMedian).toBeLessThan(30);
  });
});
