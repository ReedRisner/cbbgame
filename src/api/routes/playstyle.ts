import { Router } from 'express';
import { prisma } from './_db';
import { getEffectiveCoachingRatings } from '../../systems/coaching/assistants';
import { recalculateTeamFitScores } from '../../systems/playstyle/fit';

const router = Router();

router.get('/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const coach = await prisma.coach.findFirstOrThrow({ where: { teamId, role: 'HEAD' } });
  res.json({ coach, effectiveRatings: await getEffectiveCoachingRatings(teamId) });
});

router.put('/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const coach = await prisma.coach.findFirstOrThrow({ where: { teamId, role: 'HEAD' } });
  const updated = await prisma.coach.update({ where: { id: coach.id }, data: req.body });
  await recalculateTeamFitScores(teamId);
  res.json(updated);
});

router.get('/fit/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  res.json(await prisma.player.findMany({ where: { teamId }, select: { id: true, firstName: true, lastName: true, fitScore: true } }));
});

export default router;
