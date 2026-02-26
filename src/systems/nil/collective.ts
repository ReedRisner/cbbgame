import { prisma } from '../../api/routes/_db';
import { calculateAnnualNILBudgetFormula } from '../../formulas/nil';

export async function calculateAnnualNILBudget(teamId: number, season: number): Promise<number> {
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
  // Season 1 fallback: donorMomentum is neutral 0 due to no historical outcomes.
  const donorMomentum = season === 1 ? 0 : 0;
  return calculateAnnualNILBudgetFormula({
    boosterBudget: team.boosterBudget,
    mediaMarket: team.mediaMarket,
    currentPrestige: team.currentPrestige,
    fanInterest: team.fanIntensity,
    donorMomentum,
    fatigueModifier: team.fatigueModifier,
  });
}

export async function recalculateAllNILBudgets(season: number): Promise<void> {
  const teams = await prisma.team.findMany({ select: { id: true } });
  for (const team of teams) {
    const budget = await calculateAnnualNILBudget(team.id, season);
    await prisma.team.update({ where: { id: team.id }, data: { annualNilBudget: budget } });
  }
}
