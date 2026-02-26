import { prisma } from '../../api/routes/_db';
import { runFullPostseason } from '../postseason/pipeline';
import { generateFullSchedule } from '../schedule/assembler';
import { runWeeklyRankings } from '../rankings/weeklyPipeline';
import { runEndOfSeason } from './endOfSeason';

export type WeekResult = { season: number; week: number; gamesSimulated: number };
export type SeasonResult = { season: number; weeks: number; postseasonChampion: number };

export async function advanceSeasonWeek(season: number, week: number): Promise<WeekResult> {
  const start = new Date(Date.UTC(season, 9, 15 + (week - 1) * 7));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const games = await prisma.schedule.findMany({ where: { season, gameDate: { gte: start, lte: end } } });
  for (const g of games) {
    const homeScore = 60 + Math.floor(Math.random() * 30);
    const awayScore = 58 + Math.floor(Math.random() * 30);
    await prisma.gameLog.create({ data: { season, gameDate: g.gameDate, homeTeamId: g.homeTeamId, awayTeamId: g.awayTeamId, homeScore, awayScore, pace: 68 + Math.random() * 10, isTournament: g.isTournamentGame } });
  }
  await runWeeklyRankings(season, week);
  return { season, week, gamesSimulated: games.length };
}

export async function runFullSeason(season: number): Promise<SeasonResult> {
  const existing = await prisma.schedule.count({ where: { season } });
  if (!existing) await generateFullSchedule(season);

  await runWeeklyRankings(season, 0);
  for (let week = 1; week <= 28; week += 1) await advanceSeasonWeek(season, week);
  const postseason = await runFullPostseason(season);
  await runEndOfSeason(season);
  return { season, weeks: 34, postseasonChampion: postseason.ncaaChampion };
}
