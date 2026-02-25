import { describe, it, expect } from 'vitest';
import { calculateConferencePrestige, classifyBlueBlood, calculatePrestigeGrowth, calculatePrestigeDecay } from '../../src/formulas/prestige';

describe('prestige formulas', () => {
  it('calculates conference prestige in range', () => {
    const p = calculateConferencePrestige({ avgTeamPrestige: 75, top5AvgPrestige: 82, tourneySuccess: 70, mediaDealValue: 78, historicalWeight: 80 });
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThanOrEqual(100);
  });

  it('classifies blue blood', () => {
    expect(classifyBlueBlood({ historicalPrestige: 95, currentPrestige: 90, finalFourCount: 7 })).toBe('BLUE_BLOOD');
  });

  it('growth/decay behave directionally', () => {
    expect(calculatePrestigeGrowth({ winImpact: 10, tourneyImpact: 8, recruitingRankImpact: 6, nbaDraftPicksImpact: 4, mediaBuzz: 5, facilityBonus: 3, sanctionsPenalty: 0 })).toBeGreaterThan(0);
    expect(calculatePrestigeDecay({ baseDecay: 2, underperformanceYears: 4, historicalPrestige: 85, rolling10YearAverage: 78 })).toBeGreaterThan(2);
  });
});
