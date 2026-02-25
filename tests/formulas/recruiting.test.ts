import { describe, it, expect } from 'vitest';
import { recruitCompositeScore, scoutingUncertainty, starRatingFromComposite } from '../../src/formulas/recruiting';

describe('recruiting formulas', () => {
  it('calculates composite + stars', () => {
    const comp = recruitCompositeScore({ scoutedPotential: 85, scoutedOverall: 80, measurables: 78, eventPerformance: 82 });
    expect(comp).toBeGreaterThan(80);
    expect(starRatingFromComposite(comp)).toBe(4);
  });

  it('keeps uncertainty floor', () => {
    const uncertainty = scoutingUncertainty({ baseUncertainty: 5, scoutingInvestment: 0.99, positionFactor: 0.8, geographyFactor: 0.8 });
    expect(uncertainty).toBeGreaterThanOrEqual(1.5);
  });
});
