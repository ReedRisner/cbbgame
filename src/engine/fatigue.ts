import { calculateFatiguePenalty as formulaPenalty, calculateFatigueRate as formulaRate } from '../formulas/simulation';

export function updateFatigue(fatigue: number, stamina: number, minutesElapsed: number, context: { opponentPressFrequency: number; isOvertime: boolean }): number {
  const pressImpact = 1 + (context.opponentPressFrequency / 100) * 0.3;
  const rate = formulaRate(stamina, pressImpact, context.isOvertime);
  return Math.min(100, fatigue + (rate * minutesElapsed));
}

export function getFatiguePenalty(fatigueLevel: number) {
  return formulaPenalty(fatigueLevel);
}
