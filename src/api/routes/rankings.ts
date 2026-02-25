import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/teams', async (_req, res) => {
  const teams = await prisma.team.findMany({
    include: { conference: true },
    orderBy: { currentPrestige: 'desc' },
    take: 100
  });
  res.json(teams.map((t, i) => ({ rank: i + 1, id: t.id, name: t.name, conference: t.conference.shortName, prestige: t.currentPrestige })));
});

export default router;
