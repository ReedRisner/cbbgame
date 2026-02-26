import { Router } from 'express';
import { prisma } from './_db';
import { advanceRecruitingWeek, runFullRecruitingCycle } from '../../systems/recruiting/calendar';
import { scheduleVisit } from '../../systems/recruiting/visits';
import { upsertScoutingInvestment } from '../../systems/recruiting/scouting';
import { buildRecruitBoard } from '../../systems/recruiting/aiTargeting';

const router = Router();

router.post('/advance-week', async (req, res) => {
  const { season, week } = req.body;
  res.json(await advanceRecruitingWeek(Number(season), Number(week)));
});

router.post('/run-full-cycle', async (req, res) => {
  const { season } = req.body;
  res.json(await runFullRecruitingCycle(Number(season)));
});

router.get('/board/:teamId', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const season = Number(req.query.season ?? 1);
  res.json(await buildRecruitBoard(teamId, season));
});

router.get('/interest/:recruitId', async (req, res) => {
  const recruitId = Number(req.params.recruitId);
  const season = Number(req.query.season ?? 1);
  res.json(await prisma.recruitInterest.findMany({ where: { recruitId, season }, orderBy: { interestLevel: 'desc' } }));
});

router.post('/schedule-visit', async (req, res) => {
  const { recruitId, teamId, type, week } = req.body;
  res.json(await scheduleVisit(Number(recruitId), Number(teamId), type, Number(week)));
});

router.post('/scout', async (req, res) => {
  const { recruitId, teamId, season, investmentLevel } = req.body;
  await upsertScoutingInvestment(Number(recruitId), Number(teamId), Number(season), Number(investmentLevel));
  res.json({ ok: true });
});

export default router;
