import { describe, expect, it } from 'vitest';
import { calculateFitScore, schemeToSimParams } from '../../src/formulas/playstyle';

describe('playstyle formulas', () => {
  it('maps scheme to params', () => {
    const p = schemeToSimParams({ pace: 100, threePointEmphasis: 100, postUsage: 0, pressFrequency: 50, zoneVsMan: 25, pickAndRoll: 100, transitionPush: 100, defensiveAggression: 75 });
    expect(p.possessionsPerGame).toBe(78);
    expect(p.threePointAttemptRate).toBe(0.5);
  });
  it('fit score range', () => {
    expect(calculateFitScore([50, 50], [50, 50])).toBe(100);
  });
});
