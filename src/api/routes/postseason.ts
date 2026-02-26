import { Router } from 'express';
import { prisma } from './_db';
import { runFullPostseason } from '../../systems/postseason/pipeline';
import { simulateNCAATournamentRound } from '../../systems/postseason/ncaaTournament';

const router = Router();

router.get('/conf-tournament/:conferenceId/:season', async (req, res) => res.json(await prisma.conferenceTournament.findUnique({ where: { conferenceId_season: { conferenceId: Number(req.params.conferenceId), season: Number(req.params.season) } } })));
router.get('/ncaa/:season', async (req, res) => res.json(await prisma.ncaaTournament.findMany({ where: { season: Number(req.params.season) } })));
router.get('/ncaa/:season/round/:round', async (req, res) => res.json(await prisma.ncaaTournament.findMany({ where: { season: Number(req.params.season), roundEliminated: req.params.round as any } })));
router.get('/nit/:season', async (req, res) => res.json(await prisma.nitTournament.findMany({ where: { season: Number(req.params.season) } })));
router.get('/cbi/:season', async (req, res) => res.json(await prisma.postseasonResult.findMany({ where: { season: Number(req.params.season), tournament: 'CBI' } })));
router.get('/cit/:season', async (req, res) => res.json(await prisma.postseasonResult.findMany({ where: { season: Number(req.params.season), tournament: 'CIT' } })));
router.post('/simulate-conf-tournaments', async (req, res) => res.json(await runFullPostseason(Number(req.body?.season))));
router.post('/simulate-ncaa-round', async (req, res) => res.json(await simulateNCAATournamentRound(Number(req.body?.season), String(req.body?.round ?? 'R64'))));
router.post('/simulate-full', async (req, res) => res.json(await runFullPostseason(Number(req.body?.season))));

export default router;
