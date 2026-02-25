import { describe, it, expect } from 'vitest';
import { calculatePlayerOverall, calculateDevelopmentPoints } from '../../src/formulas/player';

describe('player formulas', () => {
  const attrs = {
    speed: 80, acceleration: 78, strength: 60, vertical: 75, stamina: 74, durability: 72,
    insideScoring: 65, midRange: 72, threePoint: 80, freeThrow: 78, layup: 76, postMoves: 40,
    ballHandling: 84, passing: 82, courtVision: 80, perimeterDefense: 74, interiorDefense: 45,
    steal: 72, block: 35, rebounding: 50, offensiveIQ: 75, defensiveIQ: 70, shotCreation: 77, pickAndRoll: 79
  };

  it('weights positions differently', () => {
    const pg = calculatePlayerOverall('PG', attrs);
    const c = calculatePlayerOverall('C', attrs);
    expect(Math.abs(pg - c)).toBeGreaterThan(2);
  });

  it('calculates development points', () => {
    const pts = calculateDevelopmentPoints({ baseDev: 5, workEthicMult: 1.2, coachDevSkill: 1.1, playingTimeMult: 1.05, ageFactor: 1, fitBonus: 1.03 });
    expect(pts).toBeGreaterThan(6);
  });
});
