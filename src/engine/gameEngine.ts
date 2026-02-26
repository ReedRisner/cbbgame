import { normalRandom } from '../utils/random';
import { calculateHomeCourtAdvantage } from './homeCourt';
import { generateRefCrew } from './referee';
import { simulatePossession } from './possession';
import { setupGame } from './pregame';
import type { GameContext } from './types';

export type TeamTotals = {
  points: number;
  fga: number;
  fgm: number;
  tpa: number;
  tpm: number;
  fta: number;
  ftm: number;
  turnovers: number;
  rebounds: number;
  assists: number;
  fouls: number;
};

export type GameResult = {
  homeScore: number;
  awayScore: number;
  homeFga: number;
  awayFga: number;
  homeTov: number;
  awayTov: number;
  homeReb: number;
  awayReb: number;
  homeAst: number;
  awayAst: number;
  homeFouls: number;
  awayFouls: number;
  home3pm: number;
  away3pm: number;
  home3pa: number;
  away3pa: number;
  overtimePeriods: number;
  possessions: Array<{ team: 'home' | 'away'; points: number }>;
};

export async function simulateGame(homeTeamId: number, awayTeamId: number, context: GameContext): Promise<GameResult> {
  const setup = setupGame(homeTeamId, awayTeamId, context);
  const ref = generateRefCrew();
  let hca = 0;
  try {
    hca = await calculateHomeCourtAdvantage(homeTeamId, context.neutralSite);
  } catch {
    hca = context.neutralSite ? 0 : 3.5;
  }
  const targetPossessions = Math.round((context.homeScheme.possessionsPerGame + context.awayScheme.possessionsPerGame) / 2);

  const home: TeamTotals = { points: 0, fga: 0, fgm: 0, tpa: 0, tpm: 0, fta: 0, ftm: 0, turnovers: 0, rebounds: 0, assists: 0, fouls: 0 };
  const away: TeamTotals = { points: 0, fga: 0, fgm: 0, tpa: 0, tpm: 0, fta: 0, ftm: 0, turnovers: 0, rebounds: 0, assists: 0, fouls: 0 };
  const possessions: Array<{ team: 'home' | 'away'; points: number }> = [];

  let offense: 'home' | 'away' = 'home';
  let timeRemaining = setup.timeRemaining;
  let possessionCount = 0;

  while (timeRemaining > 0 && possessionCount < targetPossessions * 2) {
    possessionCount += 1;
    const isHome = offense === 'home';
    const offTotals = isHome ? home : away;
    const defTotals = isHome ? away : home;
    const p = simulatePossession(
      isHome ? context.homeLineup : context.awayLineup,
      isHome ? context.awayLineup : context.homeLineup,
      isHome ? context.homeScheme : context.awayScheme,
      isHome ? context.awayScheme : context.homeScheme,
      { timeRemaining, margin: Math.abs(home.points - away.points), refFoulRate: ref.foulCallRate },
    );

    timeRemaining -= p.seconds;

    if (p.turnover) offTotals.turnovers += 1;
    if (p.foul) {
      offTotals.fta += p.threeAttempt ? 3 : 2;
      offTotals.ftm += p.points;
      defTotals.fouls += 1;
    } else {
      offTotals.fga += 1;
      if (p.threeAttempt) offTotals.tpa += 1;
      if (p.made) {
        offTotals.fgm += 1;
        if (p.threeAttempt) offTotals.tpm += 1;
        if (p.assist) offTotals.assists += 1;
      } else {
        if (p.reboundedOffense) offTotals.rebounds += 1;
        else defTotals.rebounds += 1;
      }
    }

    offTotals.points += p.points;
    possessions.push({ team: offense, points: p.points });

    if (Math.random() < 0.06) {
      (isHome ? home : away).points += hca > 0 ? 0 : 0;
    }

    offense = p.reboundedOffense ? offense : (offense === 'home' ? 'away' : 'home');
  }

  home.points += Math.round(hca * 0.9 + normalRandom(0, 1.2));

  let overtimePeriods = 0;
  while (home.points === away.points && overtimePeriods < 3) {
    overtimePeriods += 1;
    home.points += Math.round(normalRandom(7, 3));
    away.points += Math.round(normalRandom(7, 3));
    home.fga += 6;
    away.fga += 6;
  }

  return {
    homeScore: home.points,
    awayScore: away.points,
    homeFga: home.fga,
    awayFga: away.fga,
    homeTov: home.turnovers,
    awayTov: away.turnovers,
    homeReb: home.rebounds,
    awayReb: away.rebounds,
    homeAst: home.assists,
    awayAst: away.assists,
    homeFouls: home.fouls,
    awayFouls: away.fouls,
    home3pm: home.tpm,
    away3pm: away.tpm,
    home3pa: home.tpa,
    away3pa: away.tpa,
    overtimePeriods,
    possessions,
  };
}
