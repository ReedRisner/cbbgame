import { clampedNormal } from '../utils/random';

export function calculateCinderellaFactor(
  chemistry: number,
  bestClutch: number,
  coachExp: number,
  defRating: number,
  scheduleTested: number,
): number {
  const randomness = clampedNormal(50, 15, 0, 100);
  return (chemistry * 0.25)
    + (bestClutch * 0.20)
    + (coachExp * 0.15)
    + (defRating * 0.20)
    + (scheduleTested * 100 * 0.10)
    + (randomness * 0.10);
}

export function calculatePreseasonScore(prestige: number, rosterOverall: number, returningProduction: number, recruitRank: number): number {
  return (prestige * 0.35) + (rosterOverall * 0.30) + (returningProduction * 0.20) + (recruitRank * 0.15);
}
