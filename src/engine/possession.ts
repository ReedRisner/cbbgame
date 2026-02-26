import { normalRandom, weightedChoice } from '../utils/random';
import {
  calculateFoulProbability,
  calculateMakeProbability,
  calculateOffensiveReboundProbability,
  calculateShotQuality,
  calculateTurnoverProbability,
} from '../formulas/simulation';
import { getClutchMultiplier } from './clutch';
import type { PlayerGameState, SchemeParams } from './types';

export type PossessionResult = {
  points: number;
  turnover: boolean;
  foul: boolean;
  threeAttempt: boolean;
  made: boolean;
  reboundedOffense: boolean;
  assist: boolean;
  seconds: number;
};

export function simulatePossession(
  offense: PlayerGameState[],
  defense: PlayerGameState[],
  scheme: SchemeParams,
  defenseScheme: SchemeParams,
  gameState: { timeRemaining: number; margin: number; refFoulRate: number },
): PossessionResult {
  const handler = [...offense].sort((a, b) => (b.ballHandling + b.overall) - (a.ballHandling + a.overall))[0];

  const turnoverProb = calculateTurnoverProbability(defenseScheme.pressRate * 100, defenseScheme.defAggRate * 100, handler.ballHandling);
  if (Math.random() < turnoverProb) {
    return { points: 0, turnover: true, foul: false, threeAttempt: false, made: false, reboundedOffense: false, assist: false, seconds: Math.max(8, Math.min(30, 24 - (scheme.possessionsPerGame / 10) + normalRandom(0, 3))) };
  }

  const shotType = weightedChoice(['close', 'mid', 'three'] as const, [
    Math.max(0.15, 1 - scheme.threePointAttemptRate - 0.25),
    0.25,
    scheme.threePointAttemptRate,
  ]);

  const foulProb = calculateFoulProbability((defenseScheme.defAggRate * 100), 50, shotType === 'close' ? 0.9 : 0.5, { foulCallRate: gameState.refFoulRate });
  if (Math.random() < foulProb) {
    const ftPct = handler.freeThrow / 100;
    const fts = shotType === 'three' ? 3 : 2;
    let points = 0;
    for (let i = 0; i < fts; i += 1) {
      if (Math.random() < ftPct) points += 1;
    }
    return { points, turnover: false, foul: true, threeAttempt: shotType === 'three', made: points > 0, reboundedOffense: false, assist: false, seconds: Math.max(8, Math.min(30, 24 - (scheme.possessionsPerGame / 10) + normalRandom(0, 3))) };
  }

  const spacing = offense.slice(0, 5).reduce((s, p) => s + p.threePoint, 0) / 5;
  const defender = defense[Math.floor(Math.random() * Math.min(5, defense.length))];
  const defAttr = shotType === 'close' ? defender.interiorDefense : defender.perimeterDefense * (shotType === 'three' ? 0.8 : 1);
  const quality = calculateShotQuality(
    shotType === 'close' ? handler.closeShot : shotType === 'mid' ? handler.midRange : handler.threePoint,
    spacing,
    handler.fitScore * 0.05,
    defAttr,
    Math.max(0, (handler.minutesPlayed - 30) * 0.8),
  ) + normalRandom(0, 8);

  const clutch = getClutchMultiplier(handler.clutch, gameState);
  const makeProb = calculateMakeProbability(shotType, quality * clutch);
  const made = Math.random() < makeProb;
  if (made) {
    return {
      points: shotType === 'three' ? 3 : 2,
      turnover: false,
      foul: false,
      threeAttempt: shotType === 'three',
      made: true,
      reboundedOffense: false,
      assist: Math.random() < 0.55,
      seconds: Math.max(8, Math.min(30, 24 - (scheme.possessionsPerGame / 10) + normalRandom(0, 3))),
    };
  }

  const offRebProb = calculateOffensiveReboundProbability(50, 50, defenseScheme.zoneRate > 0.5 ? 0.92 : 1, 1 + normalRandom(0, 0.05));
  const reboundedOffense = Math.random() < offRebProb;
  return {
    points: 0,
    turnover: false,
    foul: false,
    threeAttempt: shotType === 'three',
    made: false,
    reboundedOffense,
    assist: false,
    seconds: Math.max(8, Math.min(30, 24 - (scheme.possessionsPerGame / 10) + normalRandom(0, 3))),
  };
}
