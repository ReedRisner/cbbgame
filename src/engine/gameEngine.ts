import { simulatePossession } from './possession';
import { setupGame } from './pregame';
import type { GameContext } from './types';

export type GameResult = {
  homeScore: number;
  awayScore: number;
  homeFga: number;
  awayFga: number;
  homeTov: number;
  awayTov: number;
  overtimePeriods: number;
  possessions: Array<{ team: 'home' | 'away'; points: number }>;
};

export function simulateGame(homeTeamId: number, awayTeamId: number, context: GameContext): GameResult {
  const setup = setupGame(homeTeamId, awayTeamId, context);
  let homeScore = 0;
  let awayScore = 0;
  let homeFga = 0;
  let awayFga = 0;
  let homeTov = 0;
  let awayTov = 0;
  const possessions: Array<{ team: 'home' | 'away'; points: number }> = [];

  let offense: 'home' | 'away' = 'home';
  let timeRemaining = setup.timeRemaining;
  while (timeRemaining > 0) {
    const isHome = offense === 'home';
    const p = simulatePossession(
      isHome ? context.homeLineup : context.awayLineup,
      isHome ? context.awayLineup : context.homeLineup,
      isHome ? context.homeScheme : context.awayScheme,
      { timeRemaining, margin: Math.abs(homeScore - awayScore) },
    );
    timeRemaining -= p.seconds;
    if (isHome) {
      homeScore += p.points;
      homeFga += 1;
      if (p.turnover) homeTov += 1;
    } else {
      awayScore += p.points;
      awayFga += 1;
      if (p.turnover) awayTov += 1;
    }
    possessions.push({ team: offense, points: p.points });
    offense = offense === 'home' ? 'away' : 'home';
  }

  let overtimePeriods = 0;
  while (homeScore === awayScore && overtimePeriods < 3) {
    overtimePeriods += 1;
    for (let i = 0; i < 18; i += 1) {
      const isHome = offense === 'home';
      const p = simulatePossession(isHome ? context.homeLineup : context.awayLineup, isHome ? context.awayLineup : context.homeLineup, isHome ? context.homeScheme : context.awayScheme, { timeRemaining: 300, margin: Math.abs(homeScore - awayScore) });
      if (isHome) homeScore += p.points; else awayScore += p.points;
      offense = offense === 'home' ? 'away' : 'home';
    }
  }

  return { homeScore, awayScore, homeFga, awayFga, homeTov, awayTov, overtimePeriods, possessions };
}
