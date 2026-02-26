import { Router } from 'express';
import { prisma } from './_db';
import { generateFullSchedule } from '../../systems/schedule/assembler';

const router = Router();

router.post('/generate', async (req, res) => {
  const season = Number(req.body?.season);
  res.json(await generateFullSchedule(season));
});

router.get('/mtes/:season', async (req, res) => {
  const season = Number(req.params.season);
  res.json(await prisma.mteEvent.findMany({ where: { season }, include: { participants: true } }));
});

router.get('/:season/team/:teamId', async (req, res) => {
  const season = Number(req.params.season);
  const teamId = Number(req.params.teamId);
  res.json(await prisma.schedule.findMany({ where: { season, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] } }));
});

router.get('/:season/week/:week', async (req, res) => {
  const season = Number(req.params.season);
  const week = Number(req.params.week);
  const start = new Date(Date.UTC(season, 9, 15 + (week - 1) * 7));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  res.json(await prisma.schedule.findMany({ where: { season, gameDate: { gte: start, lte: end } } }));
});

router.get('/:season', async (req, res) => {
  res.json(await prisma.schedule.findMany({ where: { season: Number(req.params.season) } }));
});

export default router;
