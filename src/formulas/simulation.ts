export type FatigueModifiers = {
  attributePenalty: number;
  turnoverMultiplier: number;
  foulMultiplier: number;
};

export function calculateShotQuality(baseSkill: number, spacing: number, schemeBonus: number, defense: number, fatigue: number): number {
  return baseSkill + ((spacing - 50) * 0.15) + schemeBonus - defense - fatigue;
}

export function calculateMakeProbability(shotType: 'close' | 'mid' | 'three', shotQuality: number): number {
  const basePct = shotType === 'close' ? 0.56 : shotType === 'mid' ? 0.4 : 0.35;
  return Math.max(0.05, Math.min(0.95, basePct * (1 + (shotQuality - 50) * 0.008)));
}

export function calculateTurnoverProbability(press: number, defIntensity: number, ballSecurity: number): number {
  const probability = 0.14 * (1 + press + defIntensity - ballSecurity);
  return Math.max(0.03, Math.min(0.45, probability));
}

export function calculateFoulProbability(defAggression: number, foulProne: number, driveRate: number, refProfile: { foulCallRate: number }): number {
  const probability = 0.08 * (defAggression * 0.01) * (foulProne * 0.008) * (driveRate * 1.2) * refProfile.foulCallRate;
  return Math.max(0.01, Math.min(0.5, probability));
}

export function calculateOffensiveReboundProbability(teamOffReb: number, oppDefReb: number, zoneBonus: number, hustle: number): number {
  const base = teamOffReb / (teamOffReb + oppDefReb);
  return Math.max(0.05, Math.min(0.6, base * zoneBonus * hustle));
}

export function calculateHomeCourtAdvantage(fanInterest: number, altitudeFlag: number): number {
  return 3.5 + ((fanInterest - 50) * 0.06) + altitudeFlag;
}

export function calculateClutchMultiplier(clutchRating: number): number {
  return 1 + (clutchRating - 50) * 0.005;
}

export function calculateUpsetBoost(underdogCompetitiveness: number): number {
  return Math.max(0, (underdogCompetitiveness - 60) * 0.3);
}

export function calculateFatigueRate(stamina: number, pressImpact: number, isOvertime: boolean): number {
  const base = 2.5;
  const staminaFactor = 1.3 - (stamina / 100) * 0.6;
  const overtimeFactor = isOvertime ? 1.3 : 1;
  return base * staminaFactor * pressImpact * overtimeFactor;
}

export function calculateFatiguePenalty(fatigueLevel: number): FatigueModifiers {
  if (fatigueLevel < 40) return { attributePenalty: 0, turnoverMultiplier: 1, foulMultiplier: 1 };
  if (fatigueLevel < 60) return { attributePenalty: 0.02, turnoverMultiplier: 1, foulMultiplier: 1 };
  if (fatigueLevel < 80) return { attributePenalty: 0.05, turnoverMultiplier: 1.5, foulMultiplier: 1 };
  return { attributePenalty: 0.1, turnoverMultiplier: 2, foulMultiplier: 1.5 };
}

export function calculateInGameInjuryProbability(injuryProneness: number, minutesPlayed: number, physicalPlayFactor: number): number {
  return injuryProneness * (minutesPlayed / 40) * physicalPlayFactor * 0.5;
}
