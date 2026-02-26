import { prisma } from '../../api/routes/_db';
import { runPortalMarketplace } from './marketplace';

export async function runMidSeasonPortalWindow(season: number): Promise<{ entries: number; commitments: number }> {
  const candidates = await prisma.player.findMany({ where: { classYear: { not: 'FR' } } });
  let entries = 0;

  for (const player of candidates) {
    const qualifiesByPT = false;
    const qualifiesByCoachChange =
      (await prisma.coachingChange.count({ where: { teamId: player.teamId, season } })) > 0;
    if (!qualifiesByPT && !qualifiesByCoachChange) continue;

    entries += 1;
    await prisma.portalEntry.create({
      data: {
        playerId: player.id,
        fromTeamId: player.teamId,
        season,
        entryDateWeek: 18,
        window: 'MIDSEASON',
        reason: 'PT_FRUSTRATION',
        status: 'ENTERED',
      },
    });
  }

  const marketplace = await runPortalMarketplace(season);
  return { entries, commitments: marketplace.commitments };
}
