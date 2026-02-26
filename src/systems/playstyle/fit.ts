import { prisma } from '../../api/routes/_db';

export async function calculateFitScore(playerId: number, coachId: number): Promise<number> {
  const [player, coach] = await Promise.all([
    prisma.player.findUniqueOrThrow({ where: { id: playerId } }),
    prisma.coach.findUniqueOrThrow({ where: { id: coachId } }),
  ]);

  const playerT = [player.transitionTendency, player.shotTendency, player.postTendency, player.foulTendency, player.foulTendency, player.pickAndRoll, player.transitionTendency];
  const req = [coach.pace, coach.spacing, 100 - coach.spacing, coach.pressureDefense, coach.pressureDefense, 50, coach.transitionFocus];
  const weights = [player.position === 'PG' ? 1.5 : 1, 1, player.position === 'C' ? 1.4 : 1, 1, 1, 1, 1.2];

  let mismatch = 0;
  for (let i = 0; i < req.length; i += 1) {
    mismatch += Math.abs(playerT[i] - req[i]) * weights[i];
  }
  const fit = Math.max(0, Math.min(100, 100 - (mismatch / req.length)));

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
