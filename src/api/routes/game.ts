import { Router } from 'express';
import { prisma } from './_db';
import { simulateWeek, simulateSeason } from '../../engine/batchSim';
import { getSchemeParameters } from '../../systems/playstyle/scheme';
import { getCoachEffects } from '../../systems/coaching/attributes';
import type { GameContext, PlayerGameState } from '../../engine/types';

const router = Router();

async function buildLineup(teamId: number): Promise<PlayerGameState[]> {
  const players = await prisma.player.findMany({ where: { teamId }, orderBy: { trueOverall: 'desc' }, take: 8 });
  return players.map((p) => ({
    playerId: p.id,
    teamId,
    overall: p.trueOverall,
    fatigue: 0,
    minutesPlayed: 0,
    clutch: p.clutch,
    stamina: p.stamina,
    ballHandling: p.ballHandling,
    perimeterDefense: p.perimeterDefense,
    interiorDefense: p.interiorDefense,
    threePoint: p.threePoint,
    midRange: p.midRange,
    closeShot: p.insideScoring,
    freeThrow: p.freeThrow,
    competitiveness: p.competitiveness,
    injuryProneness: p.injuryProneness,
    fitScore: p.fitScore,
  }));
}

async function buildFallbackContext(homeTeamId: number, awayTeamId: number): Promise<GameContext> {
  const [homeCoach, awayCoach] = await Promise.all([
    prisma.coach.findFirstOrThrow({ where: { teamId: homeTeamId, role: 'HEAD' } }),
    prisma.coach.findFirstOrThrow({ where: { teamId: awayTeamId, role: 'HEAD' } })
  ]);

  const [homeLineup, awayLineup, homeScheme, awayScheme, homeFx, awayFx] = await Promise.all([
    buildLineup(homeTeamId),
    buildLineup(awayTeamId),
    getSchemeParameters(homeCoach.id),
    getSchemeParameters(awayCoach.id),
    getCoachEffects(homeCoach.id),
    getCoachEffects(awayCoach.id)
  ]);

  return {
    season: 2026,
    week: 1,
    isConference: false,
    isTournament: false,
    isNCAATournament: false,
    neutralSite: false,
    homeLineup,
    awayLineup,
    homeScheme,
    awayScheme,
    homeCoachEffects: homeFx,
    awayCoachEffects: awayFx,
    storePossessions: false
  };
}

router.post('/simulate', async (req, res) => {
  try {
    const { homeTeamId, awayTeamId, context } = req.body as { homeTeamId?: number; awayTeamId?: number; context?: GameContext };

    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({ error: 'homeTeamId and awayTeamId are required' });
    }

    const { simulateGame } = await import('../../engine/gameEngine');
    const resolvedContext = context ?? (await buildFallbackContext(Number(homeTeamId), Number(awayTeamId)));
    const result = await simulateGame(Number(homeTeamId), Number(awayTeamId), resolvedContext);
    return res.json(result);
  } catch (error) {
    console.error('POST /api/game/simulate failed', error);
    return res.status(500).json({ error: 'Failed to simulate game' });
  }
});

router.post('/simulate-week', async (req, res) => {
  try {
    const { season, week } = req.body;
    return res.json(await simulateWeek(Number(season), Number(week)));
  } catch (error) {
    console.error('POST /api/game/simulate-week failed', error);
    return res.status(500).json({ error: 'Failed to simulate week' });
  }
});

router.post('/simulate-season', async (req, res) => {
  try {
    const { season } = req.body;
    return res.json(await simulateSeason(Number(season)));
  } catch (error) {
    console.error('POST /api/game/simulate-season failed', error);
    return res.status(500).json({ error: 'Failed to simulate season' });
  }
});

router.get('/:gameId', async (req, res) => {
  try {
    return res.json(await prisma.gameLog.findUnique({ where: { id: Number(req.params.gameId) }, include: { playerStats: true, refAssignment: true } }));
  } catch (error) {
    console.error('GET /api/game/:gameId failed', error);
    return res.status(500).json({ error: 'Failed to load game' });
  }
});

router.get('/:gameId/possessions', async (req, res) => {
  try {
    return res.json(await prisma.gamePossession.findMany({ where: { gameId: Number(req.params.gameId) }, orderBy: { possessionNumber: 'asc' } }));
  } catch (error) {
    console.error('GET /api/game/:gameId/possessions failed', error);
    return res.status(500).json({ error: 'Failed to load possessions' });
  }
});

router.get('/:gameId/boxscore', async (req, res) => {
  try {
    return res.json(await prisma.playerGameStat.findMany({ where: { gameLogId: Number(req.params.gameId) } }));
  } catch (error) {
    console.error('GET /api/game/:gameId/boxscore failed', error);
    return res.status(500).json({ error: 'Failed to load boxscore' });
  }
});

export default router;
