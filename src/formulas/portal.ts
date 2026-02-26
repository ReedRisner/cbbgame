export function calculatePortalEntryProbability(input: {
  expectedMinutes: number;
  actualMinutes: number;
  marketValueNIL: number;
  currentNIL: number;
  coachChangePush: number;
  sanctionsPush: number;
  ego: number;
  maturity: number;
  loyalty: number;
  jealousyPortalBoost?: number;
  baseRate?: number;
}): number {
  const baseRate = input.baseRate ?? 0.05;
  const ptFrustration =
    input.expectedMinutes <= 0
      ? 0
      : Math.max(0, ((input.expectedMinutes - input.actualMinutes) / input.expectedMinutes) * 0.3);
  const nilGap =
    input.marketValueNIL <= 0
      ? 0
      : Math.max(0, ((input.marketValueNIL - input.currentNIL) / input.marketValueNIL) * 0.15);

  const personalityFactor = (input.ego / 100) * 0.1 - (input.maturity / 100) * 0.05 + (input.jealousyPortalBoost ?? 0);
  const loyaltyAnchor = (input.loyalty / 100) * 0.2;

  return Math.max(
    0,
    Math.min(1, baseRate + ptFrustration + nilGap + input.coachChangePush + input.sanctionsPush + personalityFactor - loyaltyAnchor),
  );
}

export function calculatePortalPlayerValue(input: {
  currentOverall: number;
  oldTeamSOS: number;
  fitScore: number;
}): number {
  const contextDiscount = Math.max(0, (input.oldTeamSOS - 50) * -0.3);
  const systemBonus = input.fitScore * 3;
  return input.currentOverall - contextDiscount + systemBonus;
}

export function calculatePortalTargetValue(input: {
  playerRating: number;
  rosterPositionAvg: number;
  needWeight: number;
  ageFactor: number;
  immediateImpact: number;
}): number {
  return (input.playerRating - input.rosterPositionAvg) * input.needWeight + input.ageFactor + input.immediateImpact;
}

export const TRANSFER_SITOUT_RULE = {
  firstTime: false,
  secondTime: true,
};

export function isImmediatelyEligibleByCount(transferCount: number): boolean {
  if (transferCount <= 0) {
    return !TRANSFER_SITOUT_RULE.firstTime;
  }

  return !TRANSFER_SITOUT_RULE.secondTime;
}

export function calculateTamperRisk(input: {
  coachEthics: number;
  nilCollective: number;
  playerValue: number;
}): number {
  return (input.coachEthics < 40 ? 0.15 : 0) + (input.nilCollective > 80 ? 0.1 : 0) + (input.playerValue > 85 ? 0.1 : 0);
}
