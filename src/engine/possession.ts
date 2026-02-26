import { normalRandom, weightedChoice } from '../utils/random';
import { calculateMakeProbability, calculateTurnoverProbability } from '../formulas/simulation';
import { getClutchMultiplier } from './clutch';
import type { PlayerGameState, SchemeParams } from './types';

export type PossessionResult = {
  points: number;
  turnover: boolean;
  shotType: 'close' | 'mid' | 'three';
  made: boolean;
  seconds: number;
};

export function simulatePossession(offense: PlayerGameState[], defense: PlayerGameState[], scheme: SchemeParams, gameState: { timeRemaining: number; margin: number }): PossessionResult {
  const handler = [...offense].sort((a, b) => (b.ballHandling + b.overall) - (a.ballHandling + a.overall))[0];
  const turnoverProb = calculateTurnoverProbability(scheme.pressRate, scheme.defAggRate, Math.max(0.2, handler.ballHandling / 100));
  if (Math.random() < turnoverProb) {
    return { points: 0, turnover: true, shotType: 'mid', made: false, seconds: Math.max(8, Math.min(30, 24 - (scheme.possessionsPerGame / 10) + normalRandom(0, 3))) };
  }

  const shotType = weightedChoice(['close', 'mid', 'three'] as const, [0.35, 0.30, scheme.threePointAttemptRate]);
  const base = shotType === 'close' ? handler.closeShot : shotType === 'mid' ? handler.midRange : handler.threePoint;
  const quality = base - defense[0].perimeterDefense + (handler.fitScore * 0.05) - Math.max(0, (handler.minutesPlayed - 30) * 0.8) + normalRandom(0, 8);
  const clutch = getClutchMultiplier(handler.clutch, gameState);
  const makeProb = Math.max(0.05, Math.min(0.95, calculateMakeProbability(shotType, quality * clutch)));
  const made = Math.random() < makeProb;
  return {
    points: made ? (shotType === 'three' ? 3 : 2) : 0,
    turnover: false,
    shotType,
    made,
    seconds: Math.max(8, Math.min(30, 24 - (scheme.possessionsPerGame / 10) + normalRandom(0, 3))),
  };
}
