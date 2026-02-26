import { prisma } from '../../api/routes/_db';
import { calculateResumeScore } from '../../formulas/rankings';

export type BubbleTeam = { teamId: number; bubbleStatus: string; projectedSeed: number | null };
export type BracketologyResult = { fieldSize: number; teams: BubbleTeam[] };

export async function runBracketology(season: number, week: number): Promise<BracketologyResult> {
  const records = await prisma.seasonRecord.findMany({ where: { season } });
  const net = await prisma.netRanking.findMany({ where: { season, week } });
  const netMap = new Map(net.map((n) => [n.teamId, 366 - n.netRank]));
  const rows = records.map((r) => ({
    teamId: r.teamId,
    resume: calculateResumeScore(2, netMap.get(r.teamId) ?? 0, r.sos ?? 50, 50, (r.conferenceWins / Math.max(1, r.conferenceWins + r.conferenceLosses)) * 100, 50, 10),
  })).sort((a, b) => b.resume - a.resume);

  await prisma.bracketology.deleteMany({ where: { season, week } });
  for (let i = 0; i < rows.length; i += 1) {
    const bubble = i < 32 ? 'LOCK' : i < 64 ? 'IN' : i < 68 ? 'LAST_FOUR_IN' : i < 72 ? 'FIRST_FOUR_OUT' : 'OUT';
    await prisma.bracketology.create({
      data: {
        season,
        week,
        teamId: rows[i].teamId,
        resumeScore: rows[i].resume,
        projectedSeed: i < 68 ? Math.floor(i / 4) + 1 : null,
        projectedRegion: ['SOUTH', 'EAST', 'MIDWEST', 'WEST'][i % 4] as any,
        bubbleStatus: bubble as any,
      },
    });
  }

  return { fieldSize: 68, teams: rows.slice(0, 72).map((r, i) => ({ teamId: r.teamId, projectedSeed: i < 68 ? Math.floor(i / 4) + 1 : null, bubbleStatus: i < 68 ? 'IN' : 'OUT' })) };
}

export async function getBubbleTeams(season: number, week: number): Promise<BubbleTeam[]> {
  const rows = await prisma.bracketology.findMany({ where: { season, week, bubbleStatus: { in: ['LAST_FOUR_IN', 'FIRST_FOUR_OUT'] } } });
  return rows.map((r) => ({ teamId: r.teamId, bubbleStatus: r.bubbleStatus, projectedSeed: r.projectedSeed }));
}
