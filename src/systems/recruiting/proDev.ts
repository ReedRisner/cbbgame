import { prisma } from '../../api/routes/_db';
import { calculateNBATrackRecord as calculateNBATrackRecordFormula, getProDevGrade } from '../../formulas/recruiting';

export async function calculateNBATrackRecord(teamId: number, season: number): Promise<number> {
  const [draftHistory, headCoach] = await Promise.all([
    prisma.draftHistory.findMany({ where: { teamId, season: { gte: season - 5, lt: season } } }),
    prisma.coach.findFirst({ where: { teamId, role: 'HEAD' } }),
  ]);

  return calculateNBATrackRecordFormula({
    draftPicksLast5yr: draftHistory.length,
    lotteryPicksLast5yr: draftHistory.filter((p) => p.draftPick <= 14).length,
    coachDevReputation: headCoach?.development ?? 50,
    seasonOneProxyCoachDevSkill: headCoach?.development ?? 50,
    hasDraftHistory: draftHistory.length > 0,
  });
}

export { getProDevGrade };
