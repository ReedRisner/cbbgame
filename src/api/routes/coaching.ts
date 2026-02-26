import { Router } from 'express';
import { prisma } from './_db';
import { runEndOfSeasonCoachingCycle } from '../../systems/coaching/evaluation';
import { getCoachingTree } from '../../systems/coaching/tree';

const router = Router();

router.get('/hot-seat/:season', async (req, res) => {
  res.json(await prisma.coachingHotSeat.findMany({ where: { season: Number(req.params.season) } }));
});

router.get('/firings/:season', async (req, res) => {
  res.json(await prisma.coach.findMany({ where: { buyoutStatus: true } }));
});

router.get('/hirings/:season', async (req, res) => {
  res.json(await prisma.coachJobOffer.findMany({ where: { season: Number(req.params.season), status: 'ACCEPTED' } }));
});

router.get('/buyouts/:season', async (req, res) => {
  res.json(await prisma.coachingBuyout.findMany({ where: { season: Number(req.params.season) } }));
});

router.get('/tree/:coachId', async (req, res) => {
  res.json(await getCoachingTree(Number(req.params.coachId)));
});

router.post('/run-cycle', async (req, res) => {
  res.json(await runEndOfSeasonCoachingCycle(Number(req.body.season)));
});

export default router;
