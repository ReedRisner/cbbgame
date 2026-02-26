import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  res.json(await prisma.player.findMany({ where: { teamId }, select: { id: true, firstName: true, lastName: true, morale: true } }));
});

export default router;
