import { Router } from 'express';
import { prisma, parsePagination } from './_db';

const router = Router();

router.get('/', async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query as any);
  const role = req.query.role as any;
  const where = role ? { role } : undefined;

  const [total, coaches] = await Promise.all([
    prisma.coach.count({ where }),
    prisma.coach.findMany({ where, skip, take: pageSize, include: { team: true }, orderBy: { overall: 'desc' } })
  ]);

  res.json({
    page,
    pageSize,
    total,
    data: coaches.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      role: c.role,
      team: c.team.name,
      overall: c.overall,
      recruiting: c.recruiting,
      development: c.development
    }))
  });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const c = await prisma.coach.findUnique({ where: { id }, include: { team: true, parentCoach: true } });
  if (!c) return res.status(404).json({ error: 'Coach not found' });

  res.json({
    ...c,
    parentCoach: c.parentCoach ? { id: c.parentCoach.id, name: `${c.parentCoach.firstName} ${c.parentCoach.lastName}` } : null,
    careerRecord: {
      wins: c.careerWins,
      losses: c.careerLosses,
      tournamentAppearances: Math.max(0, Math.round(c.careerTournamentWins / 2)),
      finalFours: Math.max(0, Math.round(c.careerTournamentWins / 8)),
      championships: Math.max(0, Math.round(c.careerTournamentWins / 15))
    }
  });
});

export default router;
