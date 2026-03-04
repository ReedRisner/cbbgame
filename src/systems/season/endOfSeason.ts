import { prisma } from '../../api/routes/_db';
import { updateRivalryIntensity } from '../schedule/rivalry';

export type EndOfSeasonSummary = { season: number; graduatedPlayers: number; declarations: number };

export async function runEndOfSeason(season: number): Promise<EndOfSeasonSummary> {
  const seniors = await prisma.player.findMany({ where: { classYear: { in: ['SR', 'GR'] } } });
  const declarations = Math.floor(seniors.length * 0.15);

  const graduatingIds = seniors.map((p) => p.id);
  if (graduatingIds.length > 0) {
    await prisma.$transaction([
      prisma.nilOffer.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.nilContract.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.transfer.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.portalEntry.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.tamperingLog.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.playerGameStat.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.award.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.draftHistory.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.gameInjury.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.playerFatigue.deleteMany({ where: { playerId: { in: graduatingIds } } }),
      prisma.player.deleteMany({ where: { id: { in: graduatingIds } } })
    ]);
  }

  await prisma.player.updateMany({ where: { classYear: 'FR' }, data: { classYear: 'SO' } });
  await prisma.player.updateMany({ where: { classYear: 'SO' }, data: { classYear: 'JR' } });
  await prisma.player.updateMany({ where: { classYear: 'JR' }, data: { classYear: 'SR' } });

  const teams = await prisma.team.findMany();
  for (const t of teams) {
    await prisma.team.update({ where: { id: t.id }, data: { currentPrestige: Math.max(1, Math.min(100, t.currentPrestige + (Math.random() - 0.5) * 3)) } });
  }

  await updateRivalryIntensity(season);
  return { season, graduatedPlayers: seniors.length, declarations };
}
