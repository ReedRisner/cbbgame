import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/:season/:conferenceId', async (req, res) => {
  const season = Number(req.params.season);
  const conferenceId = Number(req.params.conferenceId);
  const records = await prisma.seasonRecord.findMany({ where: { season, team: { conferenceId } }, include: { team: true } });
  res.json(records.sort((a, b) => (b.conferenceWins - b.conferenceLosses) - (a.conferenceWins - a.conferenceLosses)));
});

router.get('/:season', async (req, res) => {
  const season = Number(req.params.season);
  const conferences = await prisma.conference.findMany();
  const result = await Promise.all(conferences.map(async (c) => ({ conference: c, standings: await prisma.seasonRecord.findMany({ where: { season, team: { conferenceId: c.id } }, include: { team: true } }) })));
  res.json(result);
});

export default router;
