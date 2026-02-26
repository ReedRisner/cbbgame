import { prisma } from '../../api/routes/_db';
import { calculateVisitBoost as calculateVisitBoostFormula } from '../../formulas/recruiting';

export type VisitResult = { ok: boolean; reason?: string; boost?: number };

const TEAM_WEEKLY_VISIT_CAP = 8;

export async function calculateVisitBoost(team: { facilityRating: number; fanIntensity: number }, type: 'official' | 'unofficial', week: number): Promise<number> {
  const coach = await prisma.coach.findFirst({ where: { teamId: (team as any).id ?? 0, role: 'HEAD' } });
  return calculateVisitBoostFormula({
    facilityRating: team.facilityRating,
    fanInterest: team.fanIntensity,
    coachCharisma: coach?.charisma ?? 50,
    isOfficial: type === 'official',
    week,
  });
}

export async function scheduleVisit(recruitId: number, teamId: number, type: 'official' | 'unofficial', week: number): Promise<VisitResult> {
  const [officialCount, weeklyCount, team] = await Promise.all([
    prisma.recruitVisit.count({ where: { recruitId, visitType: 'OFFICIAL' } }),
    prisma.recruitVisit.count({ where: { teamId, week } }),
    prisma.team.findUnique({ where: { id: teamId } }),
  ]);

  if (!team) return { ok: false, reason: 'Team not found' };
  if (type === 'official' && officialCount >= 5) return { ok: false, reason: 'Official visit cap reached' };
  if (weeklyCount >= TEAM_WEEKLY_VISIT_CAP) return { ok: false, reason: 'Team week visit capacity reached' };

  const boost = await calculateVisitBoost(team, type, week);
  await prisma.recruitVisit.create({
    data: {
      recruitId,
      teamId,
      visitType: type === 'official' ? 'OFFICIAL' : 'UNOFFICIAL',
      season: (await prisma.recruit.findUniqueOrThrow({ where: { id: recruitId } })).season,
      week,
      boostApplied: boost,
    },
  });

  return { ok: true, boost };
}
