import { describe, expect, it } from 'vitest';
import { simulateGame } from '../../src/engine/gameEngine';

describe('game engine', () => {
  it('simulates full game', async () => {
    const p = (id: number, teamId: number) => ({ playerId: id, teamId, overall: 70, fatigue: 0, minutesPlayed: 0, clutch: 60, stamina: 70, ballHandling: 70, perimeterDefense: 65, interiorDefense: 65, threePoint: 35, midRange: 45, closeShot: 55, freeThrow: 70, competitiveness: 60, injuryProneness: 0.02, fitScore: 60 });
    const result = await simulateGame(1, 2, { season: 1, week: 1, isConference: false, isTournament: false, isNCAATournament: false, neutralSite: false, homeLineup: [1,2,3,4,5].map((i) => p(i,1)), awayLineup: [6,7,8,9,10].map((i) => p(i,2)), homeScheme: { possessionsPerGame: 70, threePointAttemptRate: 0.35, postPossessionRate: 0.2, pressRate: 0.1, zoneRate: 0.2, pnrPossessionRate: 0.3, fastBreakRate: 0.2, defAggRate: 0.2 }, awayScheme: { possessionsPerGame: 70, threePointAttemptRate: 0.35, postPossessionRate: 0.2, pressRate: 0.1, zoneRate: 0.2, pnrPossessionRate: 0.3, fastBreakRate: 0.2, defAggRate: 0.2 }, homeCoachEffects: { offensiveModifier: 0, defensiveModifier: 0, developmentMultiplier: 1, disciplineIncidentModifier: 1, gameManagementModifier: 0, adaptabilityPossessions: 8, loyaltyModifier: 0.5, ambitionModifier: 0.5, ethicsModifier: 0.5 }, awayCoachEffects: { offensiveModifier: 0, defensiveModifier: 0, developmentMultiplier: 1, disciplineIncidentModifier: 1, gameManagementModifier: 0, adaptabilityPossessions: 8, loyaltyModifier: 0.5, ambitionModifier: 0.5, ethicsModifier: 0.5 } });
    expect(result.homeScore + result.awayScore).toBeGreaterThan(100);
    expect(result.homeFga + result.awayFga).toBeGreaterThan(90);
  });
});
