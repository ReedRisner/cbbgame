import { calculateClutchMultiplier as formulaClutch, calculateUpsetBoost as formulaUpset } from '../formulas/simulation';

export function getClutchMultiplier(clutchRating: number, gameState: { timeRemaining: number; margin: number }): number {
  if (gameState.timeRemaining > 300 || gameState.margin >= 8) return 1;
  return formulaClutch(clutchRating);
}

export function getUpsetBoost(underdogCompetitiveness: number): number {
  return formulaUpset(underdogCompetitiveness);
}
