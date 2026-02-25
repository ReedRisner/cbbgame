import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.json({ teams: [], players: [], coaches: [] });

  const [teams, players, coaches] = await Promise.all([
    prisma.team.findMany({ where: { name: { contains: q, mode: 'insensitive' } }, take: 10 }),
    prisma.player.findMany({ where: { OR: [{ firstName: { contains: q, mode: 'insensitive' } }, { lastName: { contains: q, mode: 'insensitive' } }] }, take: 10 }),
    prisma.coach.findMany({ where: { OR: [{ firstName: { contains: q, mode: 'insensitive' } }, { lastName: { contains: q, mode: 'insensitive' } }] }, take: 10 })
  ]);

  res.json({
    teams: teams.map((t) => ({ id: t.id, name: t.name })),
    players: players.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}` })),
    coaches: coaches.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}` }))
  });
});

export default router;
