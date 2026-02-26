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
  defenseSchemeOrGameState: SchemeParams | { timeRemaining: number; margin: number; refFoulRate?: number },
  maybeGameState?: { timeRemaining: number; margin: number; refFoulRate?: number },
): PossessionResult {
  const defenseScheme: SchemeParams = maybeGameState
    ? (defenseSchemeOrGameState as SchemeParams)
    : scheme;
  const gameState = (maybeGameState ?? defenseSchemeOrGameState) as { timeRemaining: number; margin: number; refFoulRate?: number };

  const handler = [...offense].sort((a, b) => (b.ballHandling + b.overall) - (a.ballHandling + a.overall))[0];

  const turnoverProb = calculateTurnoverProbability(defenseScheme.pressRate * 100, 55 + defenseScheme.defAggRate * 45, handler.ballHandling);
  if (Math.random() < turnoverProb) {
    return { points: 0, turnover: true, foul: false, threeAttempt: false, made: false, reboundedOffense: false, assist: false, seconds: Math.max(9, Math.min(27, 23 - (scheme.possessionsPerGame / 11) + normalRandom(0, 2.0))) };
  }

  const shotType = weightedChoice(['close', 'mid', 'three'] as const, [
    Math.max(0.2, 1 - scheme.threePointAttemptRate - 0.28),
    0.28,
    scheme.threePointAttemptRate,
  ]);

  const foulProb = calculateFoulProbability(70 + defenseScheme.defAggRate * 30, 95, shotType === 'close' ? 1.45 : 1.15, { foulCallRate: gameState.refFoulRate ?? 1 });
  if (Math.random() < foulProb) {
    const ftPct = handler.freeThrow / 100;
    const fts = shotType === 'three' ? 3 : 2;
    let points = 0;
    for (let i = 0; i < fts; i += 1) {
      if (Math.random() < ftPct) points += 1;
    }
    return { points, turnover: false, foul: true, threeAttempt: shotType === 'three', made: points > 0, reboundedOffense: false, assist: false, seconds: Math.max(9, Math.min(27, 23 - (scheme.possessionsPerGame / 11) + normalRandom(0, 2.0))) };
  }

  const spacing = offense.slice(0, 5).reduce((s, p) => s + p.threePoint, 0) / 5;
  const defender = defense[Math.floor(Math.random() * Math.min(5, defense.length))];
  const defAttrRaw = shotType === 'close' ? defender.interiorDefense : defender.perimeterDefense * (shotType === 'three' ? 0.8 : 1);
  const defAttr = defAttrRaw * 0.65;
  const quality = calculateShotQuality(
    shotType === 'close' ? handler.closeShot : shotType === 'mid' ? handler.midRange : handler.threePoint,
    spacing,
    (handler.fitScore * 0.05) + 8.5,
    defAttr,
    Math.max(0, (handler.minutesPlayed - 30) * 0.8),
  ) + normalRandom(0, 7.0);

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
      assist: Math.random() < 0.62,
      seconds: Math.max(9, Math.min(27, 23 - (scheme.possessionsPerGame / 11) + normalRandom(0, 2.0))),
    };
  }

  const offRebProb = calculateOffensiveReboundProbability(40, 60, defenseScheme.zoneRate > 0.5 ? 0.92 : 1, 0.90 + normalRandom(0, 0.02));
  const reboundedOffense = Math.random() < offRebProb;
  return {
    points: 0,
    turnover: false,
    foul: false,
    threeAttempt: shotType === 'three',
    made: false,
    reboundedOffense,
    assist: false,
    seconds: Math.max(9, Math.min(27, 23 - (scheme.possessionsPerGame / 11) + normalRandom(0, 2.0))),
  };
}
