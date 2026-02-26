import { prisma } from '../../api/routes/_db';
import { decommitProbability } from '../../formulas/recruiting';

export async function evaluateDecommitment(recruitId: number, season: number, week: number): Promise<boolean> {
  const recruit = await prisma.recruit.findUniqueOrThrow({ where: { id: recruitId } });
  if (!recruit.signedTeamId) return false;

  const teamId = recruit.signedTeamId;
  const [coachChange, sanctions, betterNil, keyTransfer] = await Promise.all([
    prisma.coachingChange.count({ where: { teamId, season } }),
    prisma.sanction.count({ where: { teamId, season } }),
    prisma.nilOffer.count({ where: { recruitId, season, teamId: { not: teamId }, status: 'PENDING' } }),
    prisma.transfer.count({ where: { fromTeamId: teamId, season } }),
  ]);

  const triggerMultiplier =
    coachChange > 0 ? 5 : sanctions > 0 ? 4 : betterNil > 0 ? 2 : keyTransfer > 0 ? 1.5 : 1;
  const probability = decommitProbability({ loyalty: recruit.personalityLoyalty, triggerMultiplier });

  if (Math.random() >= probability) return false;

  const existing = await prisma.recruitInterest.findUnique({ where: { recruitId_teamId_season: { recruitId, teamId, season } } });
  await prisma.$transaction([
    prisma.recruit.update({ where: { id: recruitId }, data: { signedTeamId: null } }),
    prisma.recruitInterest.upsert({
      where: { recruitId_teamId_season: { recruitId, teamId, season } },
      create: { recruitId, teamId, season, interestLevel: 20, lastUpdatedWeek: week },
      update: { interestLevel: Math.max(0, (existing?.interestLevel ?? 40) - 20), lastUpdatedWeek: week },
    }),
  ]);

  return true;
}
