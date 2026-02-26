import { prisma } from '../../api/routes/_db';
import { calculatePortalEntryProbability } from '../../formulas/portal';

export async function evaluatePortalEntry(playerId: number, season: number): Promise<{ enters: boolean; probability: number; reason: string }> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId }, include: { team: true } });

  const expectedMinutes = player.classYear === 'SR' ? 30 : player.classYear === 'JR' ? 20 : 10;
  const actualMinutes = season === 1 ? expectedMinutes : expectedMinutes * 0.9;

  const coachChangePush =
    (await prisma.coachingChange.count({ where: { teamId: player.teamId, season } })) > 0 ? 0.25 : 0;
  const sanctionsPush = (await prisma.sanction.count({ where: { teamId: player.teamId, season } })) > 0 ? 0.2 : 0;

  const probability = calculatePortalEntryProbability({
    expectedMinutes,
    actualMinutes,
    marketValueNIL: Math.max(1, player.trueOverall * 10_000),
    currentNIL: 0,
    coachChangePush,
    sanctionsPush,
    ego: player.competitiveness,
    maturity: player.discipline,
    loyalty: player.loyalty,
  });

  const enters = Math.random() < probability;
  const reason = coachChangePush > 0 ? 'COACH_CHANGE' : sanctionsPush > 0 ? 'SANCTIONS' : 'BASE_RATE';
  return { enters, probability, reason };
}

export async function runPostseasonPortalEvaluation(season: number): Promise<{ entries: number }> {
  const players = await prisma.player.findMany({ where: { classYear: { not: 'FR' } } });
  let entries = 0;
  for (const player of players) {
    const result = await evaluatePortalEntry(player.id, season);
    if (!result.enters) continue;

    entries += 1;
    await prisma.portalEntry.create({
      data: {
        playerId: player.id,
        fromTeamId: player.teamId,
        season,
        entryDateWeek: 35,
        window: 'POSTSEASON',
        reason: result.reason as any,
        status: 'ENTERED',
      },
    });
  }

  return { entries };
}
