import { prisma } from './api/routes/_db';
import { generateFullSchedule } from './systems/schedule/assembler';
import { runFullSeason } from './systems/season/pipeline';

async function main() {
  const season = Number(process.argv[2] ?? 2026);
  const schedule = await generateFullSchedule(season);
  const perTeam = Object.values(schedule.gamesPerTeam);
  const min = Math.min(...perTeam);
  const max = Math.max(...perTeam);

  console.log('[Schedule] total games', schedule.totalGames);
  console.log('[Schedule] games/team min-max', min, max);
  console.log('[Schedule] conflicts', schedule.conflicts);
  console.log('[Schedule] MTE count', await prisma.mteEvent.count({ where: { season } }));

  const seasonResult = await runFullSeason(season);
  console.log('[Season] complete', seasonResult);

  const ap = await prisma.apPoll.findMany({ where: { season, week: 15 }, orderBy: { rank: 'asc' }, take: 25 });
  const net = await prisma.netRanking.count({ where: { season, week: 15 } });
  const eff = await prisma.efficiencyRating.findMany({ where: { season, week: 15 }, orderBy: { overallRating: 'desc' } });
  const bracket = await prisma.bracketology.findMany({ where: { season, week: 15 }, take: 68 });

  console.log('[Rankings] AP top25', ap.length);
  console.log('[Rankings] NET rows', net);
  console.log('[Rankings] Efficiency range', eff.at(-1)?.overallRating, eff[0]?.overallRating);
  console.log('[Rankings] Bracket field', bracket.length);

  const confTourneys = await prisma.conferenceTournament.count({ where: { season } });
  const ncaaTeams = await prisma.ncaaTournament.count({ where: { season } });
  console.log('[Postseason] conf tournaments', confTourneys);
  console.log('[Postseason] NCAA teams', ncaaTeams);
}

main().finally(async () => prisma.$disconnect());
