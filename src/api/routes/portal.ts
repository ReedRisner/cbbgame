import { Router } from 'express';
import { prisma } from './_db';
import { runPortalMarketplace } from '../../systems/portal/marketplace';

const router = Router();

router.get('/entries/:season', async (req, res) => {
  const season = Number(req.params.season);
  res.json(await prisma.portalEntry.findMany({ where: { season } }));
});

router.get('/marketplace', async (req, res) => {
  const season = Number(req.query.season ?? 1);
  res.json(await prisma.portalEntry.findMany({ where: { season, status: 'ENTERED' }, include: { player: true } }));
});

router.post('/advance', async (req, res) => {
  const { season } = req.body;
  res.json(await runPortalMarketplace(Number(season)));
});

export default router;
