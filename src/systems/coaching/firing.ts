import { prisma } from '../../api/routes/_db';
import { calculateFiringProbability, calculateHotSeatScore } from '../../formulas/coaching';

export type HotSeatResult = {
  coachId: number;
  teamId: number;
  hotSeatScore: number;
  firingProbability: number;
  expectedWins: number;
  actualWins: number;
};

function thresholdForPrestige(prestige: number): number {
  if (prestige >= 80) return 8;
  if (prestige <= 30) return 15;
  const ratio = (prestige - 30) / 50;
  return 15 - ratio * 7;
}

function projectExpectedWins(overallRank: number): number {
  if (overallRank <= 25) return 22 + ((25 - overallRank) / 25) * 6;
  if (overallRank >= 265) return 10 + ((365 - overallRank) / 100) * 6;
  return 16 + ((265 - overallRank) / 240) * 6;
}

export async function calculateHotSeat(coachId: number, season: number): Promise<HotSeatResult> {
  const coach = await prisma.coach.findUniqueOrThrow({ where: { id: coachId }, include: { team: true } });
  const teams = await prisma.team.findMany({ orderBy: { currentPrestige: 'desc' }, select: { id: true } });
  const rank = teams.findIndex((t) => t.id === coach.teamId) + 1;
  const expectedWins = projectExpectedWins(rank > 0 ? rank : 180);
  const rec = await prisma.seasonRecord.findFirst({ where: { season, teamId: coach.teamId } });
  const actualWins = rec ? rec.wins : expectedWins;
  const winGap = Math.max(0, expectedWins - actualWins);
  const fanPressure = (coach.team.fanIntensity / 100) * winGap;
  const scandalPenalty = (await prisma.sanction.aggregate({ where: { teamId: coach.teamId, season }, _sum: { severity: true } }))._sum.severity ?? 0;

  const consecutive = actualWins < expectedWins ? coach.hotSeatYears + 1 : 0;
  const hotSeatScore = calculateHotSeatScore({ expectedWins, actualWins, fanPressure, scandalPenalty, tourneyDisappointment: 0, consecutiveUnderperformYears: consecutive });
  const firingProbability = calculateFiringProbability(hotSeatScore, thresholdForPrestige(coach.team.currentPrestige));

  await prisma.coach.update({ where: { id: coachId }, data: { hotSeatYears: consecutive } });

  await prisma.coachingHotSeat.upsert({
    where: { coachId_season: { coachId, season } },
    create: { coachId, teamId: coach.teamId, season, hotSeatScore, expectedWins, actualWins, tourneyDisappointment: 0, scandalPenalty, fanPressure, firingProbability },
    update: { hotSeatScore, expectedWins, actualWins, scandalPenalty, fanPressure, firingProbability },
  });
  return { coachId, teamId: coach.teamId, hotSeatScore, firingProbability, expectedWins, actualWins };
}

export async function runEndOfSeasonFirings(season: number): Promise<{ firedCoachIds: number[] }> {
  const coaches = await prisma.coach.findMany({ where: { role: 'HEAD' } });
  const firedCoachIds: number[] = [];
  for (const coach of coaches) {
    const hs = await calculateHotSeat(coach.id, season);
    if (Math.random() < hs.firingProbability) {
      firedCoachIds.push(coach.id);
      await prisma.coach.update({ where: { id: coach.id }, data: { buyoutStatus: true } });
    }
  }
  return { firedCoachIds };
}
