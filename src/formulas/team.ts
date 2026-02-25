export function facilityUpgradeCost(baseCost: number, ratingIncrease: number): number {
  return baseCost * Math.pow(1.04, ratingIncrease);
}

export function facilityDegradation(yearsSinceUpgrade: number): number {
  return Math.floor(yearsSinceUpgrade / 3);
}

export function fanInterest(input: {
  prestige: number;
  winPct: number;
  fanBaseIntensity: number;
  starPlayerPresence: number;
  rivalryIntensity: number;
}): { score: number; homeCourtBonus: number; revenueMultiplier: number } {
  const score =
    input.prestige * 0.3 +
    input.winPct * 100 * 0.25 +
    input.fanBaseIntensity * 0.2 +
    input.starPlayerPresence * 0.15 +
    input.rivalryIntensity * 0.1;

  const homeCourtBonus = score >= 82 ? 5 : score >= 70 ? 3 : score >= 58 ? 1.5 : 0;
  const revenueMultiplier = score >= 82 ? 1.25 : score >= 70 ? 1.12 : score >= 58 ? 1.05 : 0.95;
  return { score, homeCourtBonus, revenueMultiplier };
}

export function calculateBudgetRevenue(input: {
  conferenceRevenueShare: number;
  gameDayRevenue: number;
  boosterDonations: number;
  merchRevenue: number;
  ncaaTournamentPayout: number;
}): number {
  return (
    input.conferenceRevenueShare +
    input.gameDayRevenue +
    input.boosterDonations +
    input.merchRevenue +
    input.ncaaTournamentPayout
  );
}
