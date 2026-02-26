export function calculateAnnualNILBudgetFormula(input: {
  boosterBudget: number;
  mediaMarket: number;
  currentPrestige: number;
  fanInterest: number;
  donorMomentum: number;
  fatigueModifier?: number;
}): number {
  const boosterBase = input.boosterBudget * 100_000;
  const mediaMarketMult = 0.6 + (input.mediaMarket / 100) * 0.8;
  const prestigeMult = 0.5 + (input.currentPrestige / 100) * 1.0;
  const fanInterestMult = 0.7 + (input.fanInterest / 100) * 0.6;
  const fatiguePenalty = 1 - Math.min(0.2, Math.max(0, input.fatigueModifier ?? 0));
  return boosterBase * mediaMarketMult * prestigeMult * fanInterestMult * (1 + input.donorMomentum) * fatiguePenalty;
}

export function calculatePlayerNILValueFormula(input: {
  performanceScore: number;
  socialMediaRating: number;
  marketAppeal: number;
  teamPrestige: number;
  internationalDiscount?: number;
}): number {
  const raw =
    input.performanceScore * 0.4 +
    input.socialMediaRating * 0.25 +
    input.marketAppeal * 0.2 +
    input.teamPrestige * 0.15;
  return raw * (input.internationalDiscount ?? 1);
}

export function calculateSocialMediaDelta(input: {
  per: number;
  overallProxy: number;
  mediaMarket: number;
  viralRoll: number;
  viralBoost: number;
  isSeasonOne: boolean;
}): number {
  const baseGrowth = 1;
  const performanceBoost = input.isSeasonOne ? (input.overallProxy - 65) * 0.3 : (input.per - 15) * 0.5;
  const viralEventBoost = input.viralRoll <= 0.03 ? input.viralBoost : 0;
  const marketMultiplier = input.mediaMarket / 50;
  return baseGrowth + performanceBoost + viralEventBoost + marketMultiplier;
}

export function calculateBoosterFatigue(input: { cumulativeSpending3yr: number; annualNILBudget: number }): number {
  const boosterCapacity = input.annualNILBudget * 3;
  if (boosterCapacity <= 0) return 0;
  return Math.max(0, input.cumulativeSpending3yr / boosterCapacity - 1.0) * 0.2;
}

export function calculateJealousyFactor(input: {
  teammateTopNIL: number;
  playerNIL: number;
  teammateOverall: number;
  playerOverall: number;
  ego: number;
}): { factor: number; moralePenalty: number; portalBoost: number } {
  if (input.teammateTopNIL <= 0) return { factor: 0, moralePenalty: 0, portalBoost: 0 };
  const expectedGap = Math.max(0, (input.teammateOverall - input.playerOverall) / 100);
  const jealousyFactor = Math.max(0, (input.teammateTopNIL - input.playerNIL) / input.teammateTopNIL - expectedGap) * (input.ego / 100);
  return {
    factor: jealousyFactor,
    moralePenalty: Math.min(0.08, jealousyFactor * 0.08),
    portalBoost: jealousyFactor * 0.15,
  };
}

export function enforceNILSoftCapFormula(teamBudget: number, proposedValue: number): { allowed: boolean; maxAllowed: number } {
  const maxAllowed = teamBudget * 0.25;
  return { allowed: proposedValue <= maxAllowed, maxAllowed };
}

export function calculateNILRecruitingImpact(offer: number, medianNILAtTier: number): number {
  if (medianNILAtTier <= 0) return 0;
  return Math.log(offer / medianNILAtTier + 1) * 15;
}
