import { prisma } from '../../api/routes/_db';
import { calculateMoraleDelta } from '../../formulas/playstyle';

export async function updateMorale(playerId: number, weekContext: { ptSatisfaction: number; nilJealousy: number; winLoss: number; leadershipBuffer: number }): Promise<number> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  const delta = calculateMoraleDelta(player.fitScore, weekContext.ptSatisfaction, weekContext.nilJealousy, weekContext.winLoss, weekContext.leadershipBuffer);
  const morale = Math.max(0, Math.min(100, player.morale + delta));
  await prisma.player.update({ where: { id: playerId }, data: { morale } });
  return morale;
}

export async function runWeeklyMoraleUpdate(teamId: number): Promise<{ updated: number }> {
  const players = await prisma.player.findMany({ where: { teamId } });
  const leader = Math.max(...players.map((p) => p.leadership), 50);
  for (const player of players) {
    await updateMorale(player.id, { ptSatisfaction: 0, nilJealousy: 0, winLoss: 0, leadershipBuffer: (leader / 100) * 2 });
  }
  return { updated: players.length };
}
