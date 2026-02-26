import { prisma } from './api/routes/_db';
import { simulateGame } from './engine/gameEngine';
import { getSchemeParameters } from './systems/playstyle/scheme';
import { getCoachEffects } from './systems/coaching/attributes';
import { runEndOfSeasonCoachingCycle } from './systems/coaching/evaluation';
import { recalculateTeamFitScores } from './systems/playstyle/fit';
import { runWeeklyMoraleUpdate } from './systems/playstyle/morale';

async function lineup(teamId: number) {
  const players = await prisma.player.findMany({ where: { teamId }, orderBy: { trueOverall: 'desc' }, take: 10 });
  return players.map((p) => ({ playerId: p.id, teamId, overall: p.trueOverall, fatigue: 0, minutesPlayed: 0, clutch: p.clutch, stamina: p.stamina, ballHandling: p.ballHandling, perimeterDefense: p.perimeterDefense, interiorDefense: p.interiorDefense, threePoint: p.threePoint, midRange: p.midRange, closeShot: p.insideScoring, freeThrow: p.freeThrow, competitiveness: p.competitiveness, injuryProneness: p.injuryProneness, fitScore: p.fitScore }));
}

function flag(name: string, value: number, min: number, max: number) {
  const ok = value >= min && value <= max;
  console.log(`${ok ? 'OK' : 'OUT'} ${name}: ${value.toFixed(2)} target[${min}-${max}]`);
}

async function main() {
  const teams = await prisma.team.findMany({ take: 40, orderBy: { currentPrestige: 'desc' } });
  const metrics = { pts: 0, fga: 0, tov: 0, reb: 0, ast: 0, fouls: 0, threesMade: 0, threesAtt: 0, games: 0, homeWins: 0, ot: 0, upset: 0, upsetOpps: 0 };
  for (let i = 0; i < 100; i += 1) {
    const home = teams[i % teams.length];
    const away = teams[(i + 11) % teams.length];
    const [hc, ac] = await Promise.all([
      prisma.coach.findFirstOrThrow({ where: { teamId: home.id, role: 'HEAD' } }),
      prisma.coach.findFirstOrThrow({ where: { teamId: away.id, role: 'HEAD' } }),
    ]);
    const result = await simulateGame(home.id, away.id, {
      season: 1,
      week: 1,
      isConference: false,
      isTournament: false,
      isNCAATournament: false,
      neutralSite: false,
      homeLineup: await lineup(home.id),
      awayLineup: await lineup(away.id),
      homeScheme: await getSchemeParameters(hc.id),
      awayScheme: await getSchemeParameters(ac.id),
      homeCoachEffects: await getCoachEffects(hc.id),
      awayCoachEffects: await getCoachEffects(ac.id),
    });
    metrics.pts += result.homeScore + result.awayScore;
    metrics.fga += result.homeFga + result.awayFga;
    metrics.tov += result.homeTov + result.awayTov;
    metrics.reb += result.homeReb + result.awayReb;
    metrics.ast += result.homeAst + result.awayAst;
    metrics.fouls += result.homeFouls + result.awayFouls;
    metrics.threesMade += result.home3pm + result.away3pm;
    metrics.threesAtt += result.home3pa + result.away3pa;
    metrics.games += 1;
    metrics.homeWins += result.homeScore > result.awayScore ? 1 : 0;
    metrics.ot += result.overtimePeriods > 0 ? 1 : 0;
    const diff = Math.abs(home.currentPrestige - away.currentPrestige);
    if (diff > 15) {
      metrics.upsetOpps += 1;
      const homeDog = home.currentPrestige < away.currentPrestige;
      if ((homeDog && result.homeScore > result.awayScore) || (!homeDog && result.awayScore > result.homeScore)) metrics.upset += 1;
    }
  }

  const avgPts = metrics.pts / (metrics.games * 2);
  const avgFga = metrics.fga / (metrics.games * 2);
  const avg3p = metrics.threesAtt > 0 ? (metrics.threesMade / metrics.threesAtt) * 100 : 0;
  const avgTov = metrics.tov / (metrics.games * 2);
  const avgReb = metrics.reb / (metrics.games * 2);
  const avgAst = metrics.ast / (metrics.games * 2);
  const avgFouls = metrics.fouls / (metrics.games * 2);
  const homeRate = metrics.homeWins / metrics.games;
  const otRate = metrics.ot / metrics.games;
  const upsetRate = metrics.upsetOpps ? metrics.upset / metrics.upsetOpps : 0;

  flag('Avg points/team', avgPts, 65, 75);
  flag('Avg FGA/team', avgFga, 55, 65);
  flag('Avg 3P%', avg3p, 33, 37);
  flag('Avg turnovers/team', avgTov, 12, 18);
  flag('Avg rebounds/team', avgReb, 33, 38);
  flag('Avg assists/team', avgAst, 12, 16);
  flag('Avg fouls/team', avgFouls, 16, 22);
  flag('Home win rate', homeRate, 0.58, 0.65);
  flag('Overtime rate', otRate, 0.04, 0.08);
  flag('Upset rate (diff>15)', upsetRate, 0.15, 0.25);

  const coaching = await runEndOfSeasonCoachingCycle(1);
  console.log('Coaching cycle', coaching);

  const sampleTeams = teams.slice(0, 20);
  for (const t of sampleTeams) {
    await recalculateTeamFitScores(t.id);
  }
  const fitPlayers = await prisma.player.findMany({ take: 50, select: { fitScore: true } });
  const avgFit = fitPlayers.reduce((s, p) => s + p.fitScore, 0) / Math.max(1, fitPlayers.length);
  console.log('Fit average', avgFit.toFixed(1));

  for (let week = 1; week <= 10; week += 1) {
    for (const t of sampleTeams) {
      await runWeeklyMoraleUpdate(t.id);
    }
  }
  const morale = await prisma.player.aggregate({ _min: { morale: true }, _max: { morale: true } });
  console.log('Morale min/max', morale._min.morale, morale._max.morale);
}

main().finally(async () => prisma.$disconnect());
