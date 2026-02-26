import { describe, expect, it } from 'vitest';
import { commitmentProbability, computePersonalityWeights, scoutingUncertainty } from '../../src/formulas/recruiting';

describe('recruiting formulas', () => {
  it('normalizes personality weights to 1.0', () => {
    const weights = computePersonalityWeights({ ego: 90, loyalty: 20, nbaDraftInterest: 80, maturity: 75, academicAffinity: 80 });
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it('keeps scouting range in expected bounds', () => {
    expect(scoutingUncertainty({ baseUncertainty: 15, scoutingInvestment: 0, positionFactor: 1.4, geographyFactor: 1.5 })).toBe(10);
    expect(scoutingUncertainty({ baseUncertainty: 15, scoutingInvestment: 1, positionFactor: 1, geographyFactor: 1 })).toBe(3);
  });

  it('returns high commit probability for dominant lead', () => {
    expect(commitmentProbability(95, 70)).toBeGreaterThan(0.8);
  });
});
