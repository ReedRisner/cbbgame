import { Router } from 'express';
import { prisma } from './_db';
import { getBubbleTeams } from '../../systems/rankings/bracketology';

const router = Router();

router.get('/ap/:season/:week', async (req, res) => res.json(await prisma.apPoll.findMany({ where: { season: Number(req.params.season), week: Number(req.params.week) }, orderBy: { rank: 'asc' } })));
router.get('/coaches/:season/:week', async (req, res) => res.json(await prisma.coachesPoll.findMany({ where: { season: Number(req.params.season), week: Number(req.params.week) }, orderBy: { rank: 'asc' } })));
router.get('/net/:season/:week', async (req, res) => res.json(await prisma.netRanking.findMany({ where: { season: Number(req.params.season), week: Number(req.params.week) }, orderBy: { netRank: 'asc' } })));
router.get('/efficiency/:season/:week', async (req, res) => res.json(await prisma.efficiencyRating.findMany({ where: { season: Number(req.params.season), week: Number(req.params.week) }, orderBy: { overallRating: 'desc' } })));
router.get('/bracketology/:season/:week', async (req, res) => res.json(await prisma.bracketology.findMany({ where: { season: Number(req.params.season), week: Number(req.params.week) }, orderBy: { resumeScore: 'desc' } })));
router.get('/bubble/:season/:week', async (req, res) => res.json(await getBubbleTeams(Number(req.params.season), Number(req.params.week))));
router.get('/sos/:season/:week', async (req, res) => res.json(await prisma.seasonRecord.findMany({ where: { season: Number(req.params.season) }, orderBy: { sos: 'desc' } })));

export default router;
