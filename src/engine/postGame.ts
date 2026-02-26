import { prisma } from '../api/routes/_db';

export async function processPostGame(gameResult: { gameId: number; homeTeamId: number; awayTeamId: number; homeScore: number; awayScore: number }): Promise<void> {
  const homeWin = gameResult.homeScore > gameResult.awayScore;
  const [homeRecord, awayRecord] = await Promise.all([
    prisma.seasonRecord.findFirst({ where: { teamId: gameResult.homeTeamId } }),
    prisma.seasonRecord.findFirst({ where: { teamId: gameResult.awayTeamId } }),
  ]);
  if (homeRecord) {
    await prisma.seasonRecord.update({ where: { id: homeRecord.id }, data: { wins: { increment: homeWin ? 1 : 0 }, losses: { increment: homeWin ? 0 : 1 } } });
  }
  if (awayRecord) {
    await prisma.seasonRecord.update({ where: { id: awayRecord.id }, data: { wins: { increment: homeWin ? 0 : 1 }, losses: { increment: homeWin ? 1 : 0 } } });
  }
}
