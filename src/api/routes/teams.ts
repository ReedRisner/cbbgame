import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/', async (req, res) => {
  const tier = req.query.tier as string | undefined;
  const conferenceId = req.query.conferenceId ? Number(req.query.conferenceId) : undefined;
  const sortBy = (req.query.sortBy as string) ?? 'currentPrestige';
  const order: 'asc' | 'desc' = (req.query.order as 'asc' | 'desc') ?? 'desc';

  const teams = await prisma.team.findMany({
    where: {
      conferenceId,
      conference: tier ? { tier: tier as any } : undefined
    },
    include: { conference: true },
    orderBy: { [sortBy]: order }
  });

  res.json(teams.map((t) => ({
    id: t.id,
    name: t.name,
    mascot: t.mascot,
    conference: t.conference.shortName ?? t.conference.name,
    conferenceId: t.conferenceId,
    tier: t.conference.tier,
    prestige: t.currentPrestige,
    record: '0-0'
  })));
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const team = await prisma.team.findUnique({
    where: { id },
    include: { conference: true, players: true, coaches: true }
  });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

router.get('/:id/roster', async (req, res) => {
  const id = Number(req.params.id);
  const roster = await prisma.player.findMany({
    where: { teamId: id },
    select: {
      id: true, firstName: true, lastName: true, position: true, classYear: true,
      trueOverall: true, heightInches: true, weight: true
    },
    orderBy: { trueOverall: 'desc' }
  });
  res.json(roster.map((p) => ({ ...p, name: `${p.firstName} ${p.lastName}` })));
});

export default router;
