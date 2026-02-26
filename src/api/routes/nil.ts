import { Router } from 'express';
import { prisma } from './_db';
import { runTeamJealousyCheck } from '../../systems/nil/jealousy';
import { createNILContract } from '../../systems/nil/contracts';

const router = Router();

router.get('/budget/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
  const spending = await prisma.nilContract.aggregate({ where: { teamId, status: 'ACTIVE' }, _sum: { annualValue: true } });
  res.json({ budget: team.annualNilBudget, spending: spending._sum.annualValue ?? 0, fatigueModifier: team.fatigueModifier });
});

router.get('/contracts/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  res.json(await prisma.nilContract.findMany({ where: { teamId, status: 'ACTIVE' }, include: { player: true } }));
});

router.get('/jealousy/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  res.json(await runTeamJealousyCheck(teamId, Number(req.query.season ?? 1)));
});

router.post('/offer', async (req, res) => {
  const { playerId, teamId, value, years, bonus } = req.body;
  res.json(await createNILContract(Number(playerId), Number(teamId), Number(value), Number(years), Number(bonus)));
});

export default router;
