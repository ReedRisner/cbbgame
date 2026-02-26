import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/:season/standings', async (req, res) => {
  const season = Number(req.params.season);
  const records = await prisma.seasonRecord.findMany({ where: { season }, include: { team: true } });
  res.json(records.sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses)));
});

router.get('/:season/records', async (req, res) => {
  res.json(await prisma.seasonRecord.findMany({ where: { season: Number(req.params.season) }, include: { team: true } }));
});

export default router;
