import { normalRandom } from '../utils/random';

export type RefProfile = { foulCallRate: number; homeWhistleBias: number; tightnessLevel: number };

export function generateRefCrew(): RefProfile {
  return {
    foulCallRate: Math.max(0.85, Math.min(1.15, normalRandom(1, 0.08))),
    homeWhistleBias: normalRandom(0.02, 0.01),
    tightnessLevel: Math.max(0.8, Math.min(1.2, normalRandom(1, 0.1))),
  };
}
