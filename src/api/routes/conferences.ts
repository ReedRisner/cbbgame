import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/', async (_req, res) => {
  const conferences = await prisma.conference.findMany({ orderBy: [{ tier: 'asc' }, { prestige: 'desc' }] });
  res.json(conferences.map((c) => ({
    id: c.id,
    name: c.name,
    tier: c.tier,
    prestige: c.prestige,
    memberCount: c.memberCount,
    mediaDealValue: c.mediaDealValue
  })));
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const conference = await prisma.conference.findUnique({
    where: { id },
    include: { teams: { orderBy: { currentPrestige: 'desc' } } }
  });
  if (!conference) return res.status(404).json({ error: 'Conference not found' });

  const prestiges = conference.teams.map((t) => t.currentPrestige);
  const avgPrestige = prestiges.reduce((a, b) => a + b, 0) / Math.max(1, prestiges.length);
  res.json({
    ...conference,
    stats: {
      avgPrestige,
      topTeam: conference.teams[0]?.name ?? null,
      bottomTeam: conference.teams[conference.teams.length - 1]?.name ?? null
    }
  });
});

export default router;
