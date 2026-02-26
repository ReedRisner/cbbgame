import { prisma } from '../../api/routes/_db';
import { generateConferenceSchedule, type ScheduleEntry } from './conference';
import { generateMTEs, assignTeamsToMTEs } from './mte';
import { generateNonConferenceSchedule } from './nonConference';

export type ScheduleSummary = {
  totalGames: number;
  gamesPerTeam: Record<number, number>;
  conflicts: number;
};

function toDateForWeek(season: number, week: number): Date {
  const d = new Date(Date.UTC(season, 9, 15));
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7);
  return d;
}

export async function generateFullSchedule(season: number): Promise<ScheduleSummary> {
  await generateMTEs(season);
  await assignTeamsToMTEs(season);

  const entries: ScheduleEntry[] = [];
  entries.push(...await generateNonConferenceSchedule(season));

  const conferences = await prisma.conference.findMany();
  for (const conf of conferences) entries.push(...await generateConferenceSchedule(conf.id, season));

  await prisma.schedule.deleteMany({ where: { season } });
  for (const e of entries) {
    await prisma.schedule.create({
      data: {
        season,
        gameDate: toDateForWeek(season, e.week),
        conferenceId: e.conferenceId,
        homeTeamId: e.homeTeamId,
        awayTeamId: e.awayTeamId,
        isConferenceGame: e.isConferenceGame,
        isTournamentGame: e.isTournamentGame,
        mteId: e.mteId,
      },
    });
  }

  const gamesPerTeam: Record<number, number> = {};
  const seen = new Set<string>();
  let conflicts = 0;
  for (const e of entries) {
    gamesPerTeam[e.homeTeamId] = (gamesPerTeam[e.homeTeamId] ?? 0) + 1;
    gamesPerTeam[e.awayTeamId] = (gamesPerTeam[e.awayTeamId] ?? 0) + 1;
    const hKey = `${e.homeTeamId}-${e.week}`;
    const aKey = `${e.awayTeamId}-${e.week}`;
    if (seen.has(hKey)) conflicts += 1;
    if (seen.has(aKey)) conflicts += 1;
    seen.add(hKey);
    seen.add(aKey);
  }

  return { totalGames: entries.length, gamesPerTeam, conflicts };
}
