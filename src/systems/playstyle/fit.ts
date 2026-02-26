import { prisma } from '../../api/routes/_db';
import { calculateFitScore as formulaFit } from '../../formulas/playstyle';

export async function calculateFitScore(playerId: number, coachId: number): Promise<number> {
  const [player, coach] = await Promise.all([
    prisma.player.findUniqueOrThrow({ where: { id: playerId } }),
    prisma.coach.findUniqueOrThrow({ where: { id: coachId } }),
  ]);

  const playerT = [player.transitionTendency, player.shotTendency, player.postTendency, player.foulTendency, player.foulTendency, player.pickAndRoll, player.transitionTendency];
  const req = [coach.pace, coach.spacing, 100 - coach.spacing, coach.pressureDefense, coach.pressureDefense, coach.pickAndRollUsage, coach.transitionFocus];
  const fit = formulaFit(playerT, req);
  await prisma.player.update({ where: { id: playerId }, data: { fitScore: fit } });
  return fit;
}

export async function recalculateTeamFitScores(teamId: number): Promise<void> {
  const [players, coach] = await Promise.all([
    prisma.player.findMany({ where: { teamId } }),
    prisma.coach.findFirstOrThrow({ where: { teamId, role: 'HEAD' } }),
  ]);
  for (const p of players) {
    await calculateFitScore(p.id, coach.id);
  }
}
