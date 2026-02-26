import { prisma } from '../../api/routes/_db';
import { calculateBoosterFatigue as calculateBoosterFatigueFormula } from '../../formulas/nil';

export async function calculateBoosterFatigue(teamId: number, season: number): Promise<number> {
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
  const spending = await prisma.nilContract.aggregate({
    where: { teamId, season: { gte: Math.max(1, season - 2), lte: season } },
    _sum: { annualValue: true },
  });
  const cumulative = spending._sum.annualValue ?? 0;
  return calculateBoosterFatigueFormula({ cumulativeSpending3yr: cumulative, annualNILBudget: team.annualNilBudget });
}

export async function applyFatigueToAllTeams(season: number): Promise<void> {
  const teams = await prisma.team.findMany({ select: { id: true } });
  for (const team of teams) {
    const fatigue = await calculateBoosterFatigue(team.id, season);
    const spending = await prisma.nilContract.aggregate({
      where: { teamId: team.id, season: { gte: Math.max(1, season - 2), lte: season } },
      _sum: { annualValue: true },
    });
    await prisma.team.update({
      where: { id: team.id },
      data: {
        fatigueModifier: fatigue,
        cumulativeSpending3yr: spending._sum.annualValue ?? 0,
      },
    });
    await prisma.boosterFatigueTracking.upsert({
      where: { teamId_season: { teamId: team.id, season } },
      create: { teamId: team.id, season, fatigueModifier: fatigue, cumulativeSpending3yr: spending._sum.annualValue ?? 0 },
      update: { fatigueModifier: fatigue, cumulativeSpending3yr: spending._sum.annualValue ?? 0 },
    });
  }
}
