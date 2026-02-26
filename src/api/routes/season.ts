import { Router } from 'express';
import { advanceSeasonWeek, runFullSeason } from '../../systems/season/pipeline';
import { runEndOfSeason } from '../../systems/season/endOfSeason';

const router = Router();

router.post('/advance-week', async (req, res) => res.json(await advanceSeasonWeek(Number(req.body?.season), Number(req.body?.week))));
router.post('/run-full', async (req, res) => res.json(await runFullSeason(Number(req.body?.season))));
router.post('/end-of-season', async (req, res) => res.json(await runEndOfSeason(Number(req.body?.season))));

export default router;
