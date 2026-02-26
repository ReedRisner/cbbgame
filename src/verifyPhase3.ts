import { prisma } from './api/routes/_db';
import { simulateGame } from './engine/gameEngine';
import { getSchemeParameters } from './systems/playstyle/scheme';
import { getCoachEffects } from './systems/coaching/attributes';
import { runEndOfSeasonCoachingCycle } from './systems/coaching/evaluation';

async function lineup(teamId: number) {
  const players = await prisma.player.findMany({ where: { teamId }, orderBy: { trueOverall: 'desc' }, take: 8 });
  return players.map((p) => ({ playerId: p.id, teamId, overall: p.trueOverall, fatigue: 0, minutesPlayed: 0, clutch: p.clutch, stamina: p.stamina, ballHandling: p.ballHandling, perimeterDefense: p.perimeterDefense, interiorDefense: p.interiorDefense, threePoint: p.threePoint, midRange: p.midRange, closeShot: p.insideScoring, freeThrow: p.freeThrow, competitiveness: p.competitiveness, injuryProneness: p.injuryProneness, fitScore: p.fitScore }));
}

async function main() {
  const teams = await prisma.team.findMany({ take: 20 });
  const metrics = { pts: 0, fga: 0, tov: 0, games: 0, homeWins: 0, ot: 0, upset: 0, upsetOpps: 0 };
  for (let i = 0; i < 100; i += 1) {
    const home = teams[i % teams.length];
    const away = teams[(i + 5) % teams.length];
    const [hc, ac] = await Promise.all([
      prisma.coach.findFirstOrThrow({ where: { teamId: home.id, role: 'HEAD' } }),
      prisma.coach.findFirstOrThrow({ where: { teamId: away.id, role: 'HEAD' } }),
    ]);
    const result = simulateGame(home.id, away.id, {
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

  console.log('Avg points/team', (metrics.pts / (metrics.games * 2)).toFixed(1));
  console.log('Avg FGA/team', (metrics.fga / (metrics.games * 2)).toFixed(1));
  console.log('Avg TOV/team', (metrics.tov / (metrics.games * 2)).toFixed(1));
  console.log('Home win rate', (metrics.homeWins / metrics.games).toFixed(2));
  console.log('OT rate', (metrics.ot / metrics.games).toFixed(2));
  console.log('Upset rate', metrics.upsetOpps ? (metrics.upset / metrics.upsetOpps).toFixed(2) : 'n/a');

  const coaching = await runEndOfSeasonCoachingCycle(1);
  console.log('Coaching cycle', coaching);

  const fitPlayers = await prisma.player.findMany({ take: 50, select: { fitScore: true } });
  const avgFit = fitPlayers.reduce((s, p) => s + p.fitScore, 0) / Math.max(1, fitPlayers.length);
  console.log('Fit average', avgFit.toFixed(1));

  const morale = await prisma.player.aggregate({ _min: { morale: true }, _max: { morale: true } });
  console.log('Morale min/max', morale._min.morale, morale._max.morale);
}

main().finally(async () => prisma.$disconnect());
