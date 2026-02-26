import { describe, expect, it } from 'vitest';
import { simulatePossession } from '../../src/engine/possession';

describe('possession', () => {
  it('returns possession result', () => {
    const p = { playerId: 1, teamId: 1, overall: 70, fatigue: 0, minutesPlayed: 0, clutch: 60, stamina: 70, ballHandling: 70, perimeterDefense: 65, interiorDefense: 65, threePoint: 35, midRange: 45, closeShot: 55, freeThrow: 70, competitiveness: 60, injuryProneness: 0.02, fitScore: 60 };
    const scheme = { possessionsPerGame: 70, threePointAttemptRate: 0.35, postPossessionRate: 0.2, pressRate: 0.1, zoneRate: 0.2, pnrPossessionRate: 0.3, fastBreakRate: 0.2, defAggRate: 0.2 };
    const result = simulatePossession([p, p, p, p, p], [p, p, p, p, p], scheme, scheme, { timeRemaining: 240, margin: 4, refFoulRate: 1 });
    expect(result.seconds).toBeGreaterThanOrEqual(8);
  });
});
