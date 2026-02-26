import { calculateInGameInjuryProbability } from '../formulas/simulation';

export type InjuryEvent = { severity: 'MINOR' | 'MODERATE' | 'SERIOUS'; gamesOut: number };

export function checkForInjury(injuryProneness: number, gameState: { minutesPlayed: number; physicalPlayFactor: number }): InjuryEvent | null {
  const p = calculateInGameInjuryProbability(injuryProneness, gameState.minutesPlayed, gameState.physicalPlayFactor);
  if (Math.random() > p) return null;
  const roll = Math.random();
  if (roll < 0.7) return { severity: 'MINOR', gamesOut: 0 };
  if (roll < 0.9) return { severity: 'MODERATE', gamesOut: 0 };
  return { severity: 'SERIOUS', gamesOut: Math.floor(4 + Math.random() * 13) };
}
