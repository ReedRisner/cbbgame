import { Position } from '@prisma/client';

const positionWeights: Record<Position, Record<string, number>> = {
  PG: { ballHandling: 0.16, passing: 0.16, courtVision: 0.12, threePoint: 0.11, perimeterDefense: 0.1, speed: 0.1, offensiveIQ: 0.09, steal: 0.08, shotCreation: 0.08 },
  SG: { threePoint: 0.15, shotCreation: 0.14, perimeterDefense: 0.12, speed: 0.11, ballHandling: 0.11, midRange: 0.1, offensiveIQ: 0.09, layup: 0.1, freeThrow: 0.08 },
  SF: { perimeterDefense: 0.13, rebounding: 0.12, threePoint: 0.11, layup: 0.11, strength: 0.1, offensiveIQ: 0.1, defensiveIQ: 0.1, shotCreation: 0.11, stamina: 0.12 },
  PF: { interiorDefense: 0.15, rebounding: 0.16, strength: 0.14, postMoves: 0.11, layup: 0.1, block: 0.11, defensiveIQ: 0.09, stamina: 0.07, passing: 0.07 },
  C: { interiorDefense: 0.17, rebounding: 0.17, block: 0.13, strength: 0.14, postMoves: 0.12, layup: 0.09, defensiveIQ: 0.1, stamina: 0.04, passing: 0.04 }
};

export function calculatePlayerOverall(position: Position, attrs: Record<string, number>): number {
  const weights = positionWeights[position];
  let score = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    score += (attrs[key] ?? 50) * weight;
  });
  return Math.max(25, Math.min(99, score));
}

export function calculateDevelopmentPoints(input: {
  baseDev: number;
  workEthicMult: number;
  coachDevSkill: number;
  playingTimeMult: number;
  ageFactor: number;
  fitBonus: number;
}): number {
  return (
    input.baseDev *
    input.workEthicMult *
    input.coachDevSkill *
    input.playingTimeMult *
    input.ageFactor *
    input.fitBonus
  );
}
