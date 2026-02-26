import { prisma } from '../../api/routes/_db';
import { calculateJealousyFactor } from '../../formulas/nil';

export async function calculateJealousy(playerId: number): Promise<{ factor: number; moralePenalty: number; portalBoost: number }> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  const contracts = await prisma.nilContract.findMany({ where: { teamId: player.teamId, status: 'ACTIVE' }, include: { player: true } });
  const top = contracts.reduce((acc, c) => (c.annualValue > acc.annualValue ? c : acc), contracts[0] ?? { annualValue: 0, player: { trueOverall: player.trueOverall } } as any);
  const own = contracts.find((c) => c.playerId === playerId);

  return calculateJealousyFactor({
    teammateTopNIL: top?.annualValue ?? 0,
    playerNIL: own?.annualValue ?? 0,
    teammateOverall: top?.player.trueOverall ?? player.trueOverall,
    playerOverall: player.trueOverall,
    ego: player.competitiveness,
  });
}

export async function runTeamJealousyCheck(teamId: number, _season: number): Promise<{ flagged: number }> {
  const players = await prisma.player.findMany({ where: { teamId }, select: { id: true } });
  let flagged = 0;
  for (const p of players) {
    const jealousy = await calculateJealousy(p.id);
    if (jealousy.factor > 0.1) flagged += 1;
  }
  return { flagged };
}
