import { Router } from 'express';
import { prisma } from './_db';
import { simulateWeek, simulateSeason } from '../../engine/batchSim';

const router = Router();

router.post('/simulate-week', async (req, res) => {
  const { season, week } = req.body;
  res.json(await simulateWeek(Number(season), Number(week)));
});

router.post('/simulate-season', async (req, res) => {
  const { season } = req.body;
  res.json(await simulateSeason(Number(season)));
});

router.get('/:gameId', async (req, res) => {
  res.json(await prisma.gameLog.findUnique({ where: { id: Number(req.params.gameId) }, include: { playerStats: true, refAssignment: true } }));
});

router.get('/:gameId/possessions', async (req, res) => {
  res.json(await prisma.gamePossession.findMany({ where: { gameId: Number(req.params.gameId) }, orderBy: { possessionNumber: 'asc' } }));
});

router.get('/:gameId/boxscore', async (req, res) => {
  res.json(await prisma.playerGameStat.findMany({ where: { gameLogId: Number(req.params.gameId) } }));
});

export default router;
