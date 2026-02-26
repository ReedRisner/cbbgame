import { prisma } from '../api/routes/_db';
import { getSchemeParameters } from '../systems/playstyle/scheme';
import { getCoachEffects } from '../systems/coaching/attributes';
import { simulateGame } from './gameEngine';
import type { PlayerGameState } from './types';

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

export async function simulateWeek(season: number, week: number): Promise<{ games: number }> {
  const schedule = await prisma.schedule.findMany({ where: { season } });
  let games = 0;
  for (const game of schedule.slice((week - 1) * 200, week * 200)) {
    const [homeCoach, awayCoach] = await Promise.all([
      prisma.coach.findFirstOrThrow({ where: { teamId: game.homeTeamId, role: 'HEAD' } }),
      prisma.coach.findFirstOrThrow({ where: { teamId: game.awayTeamId, role: 'HEAD' } }),
    ]);
    const [homeLineup, awayLineup, homeScheme, awayScheme, homeFx, awayFx] = await Promise.all([
      buildLineup(game.homeTeamId),
      buildLineup(game.awayTeamId),
      getSchemeParameters(homeCoach.id),
      getSchemeParameters(awayCoach.id),
      getCoachEffects(homeCoach.id),
      getCoachEffects(awayCoach.id),
    ]);
    const result = await simulateGame(game.homeTeamId, game.awayTeamId, {
      season,
      week,
      isConference: game.isConferenceGame,
      isTournament: game.isTournamentGame,
      isNCAATournament: false,
      neutralSite: false,
      homeLineup,
      awayLineup,
      homeScheme,
      awayScheme,
      homeCoachEffects: homeFx,
      awayCoachEffects: awayFx,
      storePossessions: false,
    });
    await prisma.gameLog.create({ data: { season, gameDate: game.gameDate, homeTeamId: game.homeTeamId, awayTeamId: game.awayTeamId, homeScore: result.homeScore, awayScore: result.awayScore, pace: 70, overtime: result.overtimePeriods > 0, isTournament: game.isTournamentGame } });
    games += 1;
  }
  return { games };
}

export async function simulateSeason(season: number): Promise<{ weeks: number }> {
  for (let week = 1; week <= 30; week += 1) {
    await simulateWeek(season, week);
  }
  return { weeks: 30 };
}
