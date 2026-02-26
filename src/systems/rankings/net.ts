import { prisma } from '../../api/routes/_db';
import { calculateNET, classifyQuad, type Quad } from '../../formulas/rankings';

export type NETResult = { teamId: number; netRank: number; netScore: number; quad1Record: string; quad2Record: string; quad3Record: string; quad4Record: string };

export async function calculateAllNET(season: number, week: number): Promise<void> {
  const teams = await prisma.team.findMany();
  const ratings = teams.map((t) => ({ teamId: t.id, netScore: calculateNET(t.currentPrestige, t.currentPrestige, 50, 50, 50) }));
  ratings.sort((a, b) => b.netScore - a.netScore);
  await prisma.netRanking.deleteMany({ where: { season, week } });
  for (let i = 0; i < ratings.length; i += 1) {
    await prisma.netRanking.create({
      data: {
        season,
        week,
        teamId: ratings[i].teamId,
        netRank: i + 1,
        netScore: ratings[i].netScore,
        quad1Record: '0-0',
        quad2Record: '0-0',
        quad3Record: '0-0',
        quad4Record: '0-0',
      },
    });
  }
}

export async function getTeamNET(teamId: number, season: number, week: number): Promise<NETResult | null> {
  return prisma.netRanking.findUnique({ where: { season_week_teamId: { season, week, teamId } } });
}

export async function classifyGameQuad(gameId: number): Promise<Quad> {
  const game = await prisma.schedule.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('game not found');
  const awayNET = await prisma.netRanking.findFirst({ where: { season: game.season, teamId: game.awayTeamId }, orderBy: { week: 'desc' } });
  const quad = classifyQuad(awayNET?.netRank ?? 175, 'HOME');
  await prisma.schedule.update({ where: { id: gameId }, data: { quad } });
  return quad;
}
