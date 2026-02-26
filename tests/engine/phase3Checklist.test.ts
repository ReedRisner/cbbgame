import { describe, expect, it } from 'vitest';
import { generateBoxScore } from '../../src/engine/boxScore';
import { getClutchMultiplier, getUpsetBoost } from '../../src/engine/clutch';
import { getFatiguePenalty, updateFatigue } from '../../src/engine/fatigue';
import { checkForInjury } from '../../src/engine/injuries';
import { generateRefCrew } from '../../src/engine/referee';
import { simulatePossession } from '../../src/engine/possession';

describe('phase 3 deliverable checklist smoke', () => {
  it('has ref, clutch, upset, fatigue, injury models', () => {
    const ref = generateRefCrew();
    expect(ref.foulCallRate).toBeGreaterThanOrEqual(0.85);
    expect(ref.foulCallRate).toBeLessThanOrEqual(1.15);

    expect(getClutchMultiplier(80, { timeRemaining: 120, margin: 4 })).toBeGreaterThan(1);
    expect(getUpsetBoost(80)).toBeGreaterThan(0);

    const fatigue = updateFatigue(0, 70, 10, { opponentPressFrequency: 50, isOvertime: false });
    expect(fatigue).toBeGreaterThan(0);
    expect(getFatiguePenalty(85).turnoverMultiplier).toBe(2);

    const injury = checkForInjury(0.9, { minutesPlayed: 40, physicalPlayFactor: 1.2 });
    if (injury) expect(['MINOR', 'MODERATE', 'SERIOUS']).toContain(injury.severity);
  });

  it('supports backward-compatible possession calls and box score output', () => {
    const p = { playerId: 1, teamId: 1, overall: 72, fatigue: 0, minutesPlayed: 0, clutch: 60, stamina: 70, ballHandling: 70, perimeterDefense: 65, interiorDefense: 65, threePoint: 38, midRange: 46, closeShot: 56, freeThrow: 72, competitiveness: 60, injuryProneness: 0.05, fitScore: 62 };
    const scheme = { possessionsPerGame: 70, threePointAttemptRate: 0.35, postPossessionRate: 0.2, pressRate: 0.1, zoneRate: 0.2, pnrPossessionRate: 0.3, fastBreakRate: 0.2, defAggRate: 0.2 };

    const oldCall = simulatePossession([p, p, p, p, p], [p, p, p, p, p], scheme, { timeRemaining: 100, margin: 3, refFoulRate: 1 });
    const newCall = simulatePossession([p, p, p, p, p], [p, p, p, p, p], scheme, scheme, { timeRemaining: 100, margin: 3, refFoulRate: 1 });

    expect(oldCall.seconds).toBeGreaterThanOrEqual(8);
    expect(newCall.seconds).toBeGreaterThanOrEqual(8);

    const box = generateBoxScore({ homeScore: 71, awayScore: 66, homeFga: 58, awayFga: 57, homeTov: 13, awayTov: 12, homeFouls: 18, awayFouls: 17, home3pa: 20, away3pa: 19, home3pm: 7, away3pm: 6, homeFta: 22, awayFta: 18, homeFtm: 16, awayFtm: 13, homeReb: 35, awayReb: 33, homeAst: 14, awayAst: 13 });

    expect(box.teamStats.home.offensiveEfficiency).toBeGreaterThan(0);
    expect(box.teamStats.away.defensiveEfficiency).toBeGreaterThan(0);
    expect(box.metadata.finalScore).toBe('71-66');
  });
});
