import { prisma } from '../../api/routes/_db';
import { generateConferenceSchedule, type ScheduleEntry } from './conference';
import { generateMTEs, assignTeamsToMTEs } from './mte';
import { generateNonConferenceSchedule } from './nonConference';

export type ScheduleSummary = {
  totalGames: number;
  gamesPerTeam: Record<number, number>;
  conflicts: number;
  outlierTeams: number[];
};

function toDateForWeek(season: number, week: number): Date {
  const d = new Date(Date.UTC(season, 9, 15));
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7);
  return d;
}

function detectConflicts(entries: ScheduleEntry[]): number {
  const seen = new Set<string>();
  let conflicts = 0;
  for (const e of entries) {
    const hKey = `${e.homeTeamId}-${e.week}`;
    const aKey = `${e.awayTeamId}-${e.week}`;
    if (seen.has(hKey)) conflicts += 1;
    if (seen.has(aKey)) conflicts += 1;
    seen.add(hKey);
    seen.add(aKey);
  }
  return conflicts;
}

function isValidStreak(weeksToVenue: Array<{ week: number; venue: 'H' | 'A' }>): boolean {
  const ordered = [...weeksToVenue].sort((a, b) => a.week - b.week);
  let run = 1;
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].venue === ordered[i - 1].venue) {
      run += 1;
      if (run > 2) return false;
    } else {
      run = 1;
    }
  }
  return true;
}

function pickWeek(
  entry: ScheduleEntry,
  occupiedWeeks: Map<number, Set<number>>,
  venueByTeam: Map<number, Array<{ week: number; venue: 'H' | 'A' }>>,
): number | null {
  const primary = entry.isConferenceGame ? [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (const week of primary) {
    const hOcc = occupiedWeeks.get(entry.homeTeamId) ?? new Set<number>();
    const aOcc = occupiedWeeks.get(entry.awayTeamId) ?? new Set<number>();
    if (hOcc.has(week) || aOcc.has(week)) continue;

    const hVenues = [...(venueByTeam.get(entry.homeTeamId) ?? []), { week, venue: 'H' as const }];
    const aVenues = [...(venueByTeam.get(entry.awayTeamId) ?? []), { week, venue: 'A' as const }];
    if (!isValidStreak(hVenues) || !isValidStreak(aVenues)) continue;
    return week;
  }
  return null;
}

export async function generateFullSchedule(season: number): Promise<ScheduleSummary> {
  await generateMTEs(season);
  await assignTeamsToMTEs(season);

  const teams = await prisma.team.findMany();
  const teamIds = teams.map((t) => t.id);
  const gamesByTeam = new Map<number, number>(teamIds.map((id) => [id, 0]));

  const conferenceEntries: ScheduleEntry[] = [];
  const conferences = await prisma.conference.findMany();
  for (const conf of conferences) {
    const confGames = await generateConferenceSchedule(conf.id, season);
    conferenceEntries.push(...confGames);
    for (const g of confGames) {
      gamesByTeam.set(g.homeTeamId, (gamesByTeam.get(g.homeTeamId) ?? 0) + 1);
      gamesByTeam.set(g.awayTeamId, (gamesByTeam.get(g.awayTeamId) ?? 0) + 1);
    }
  }

  const mteParticipants = await prisma.mteParticipant.findMany({ include: { mte: true }, where: { mte: { season } } });
  const mteTeams = new Set<number>(mteParticipants.map((p) => p.teamId));

  const nonConferenceEntries = await generateNonConferenceSchedule({
    season,
    existingGamesByTeam: gamesByTeam,
    mteTeams,
  });

  const allEntries = [...conferenceEntries, ...nonConferenceEntries];
  const occupiedWeeks = new Map<number, Set<number>>();
  const venueByTeam = new Map<number, Array<{ week: number; venue: 'H' | 'A' }>>();
  const scheduledEntries: ScheduleEntry[] = [];

  for (const e of allEntries) {
    const week = pickWeek(e, occupiedWeeks, venueByTeam);
    if (!week) continue;
    const resolved: ScheduleEntry = { ...e, week };
    scheduledEntries.push(resolved);

    if (!occupiedWeeks.has(e.homeTeamId)) occupiedWeeks.set(e.homeTeamId, new Set<number>());
    if (!occupiedWeeks.has(e.awayTeamId)) occupiedWeeks.set(e.awayTeamId, new Set<number>());
    occupiedWeeks.get(e.homeTeamId)?.add(week);
    occupiedWeeks.get(e.awayTeamId)?.add(week);

    if (!venueByTeam.has(e.homeTeamId)) venueByTeam.set(e.homeTeamId, []);
    if (!venueByTeam.has(e.awayTeamId)) venueByTeam.set(e.awayTeamId, []);
    venueByTeam.get(e.homeTeamId)?.push({ week, venue: 'H' });
    venueByTeam.get(e.awayTeamId)?.push({ week, venue: 'A' });
  }

  // Fill to at least 28 where possible.
  const currentCounts = new Map<number, number>(teamIds.map((id) => [id, 0]));
  for (const e of scheduledEntries) {
    currentCounts.set(e.homeTeamId, (currentCounts.get(e.homeTeamId) ?? 0) + 1);
    currentCounts.set(e.awayTeamId, (currentCounts.get(e.awayTeamId) ?? 0) + 1);
  }

  let guard = 0;
  while (guard < 100_000 && teamIds.some((id) => (currentCounts.get(id) ?? 0) < 28)) {
    guard += 1;
    const need = teamIds.filter((id) => (currentCounts.get(id) ?? 0) < 28).sort((a, b) => (currentCounts.get(a) ?? 0) - (currentCounts.get(b) ?? 0));
    if (need.length < 2) break;
    const a = need[0];
    const b = need.find((id) => id !== a && (currentCounts.get(id) ?? 0) < 33);
    if (!b) break;

    const candidate: ScheduleEntry = {
      season,
      week: 0,
      homeTeamId: (currentCounts.get(a) ?? 0) <= (currentCounts.get(b) ?? 0) ? a : b,
      awayTeamId: (currentCounts.get(a) ?? 0) <= (currentCounts.get(b) ?? 0) ? b : a,
      isConferenceGame: false,
      isTournamentGame: false,
    };
    const week = pickWeek(candidate, occupiedWeeks, venueByTeam);
    if (!week) continue;

    const resolved = { ...candidate, week };
    scheduledEntries.push(resolved);
    currentCounts.set(resolved.homeTeamId, (currentCounts.get(resolved.homeTeamId) ?? 0) + 1);
    currentCounts.set(resolved.awayTeamId, (currentCounts.get(resolved.awayTeamId) ?? 0) + 1);

    if (!occupiedWeeks.has(resolved.homeTeamId)) occupiedWeeks.set(resolved.homeTeamId, new Set<number>());
    if (!occupiedWeeks.has(resolved.awayTeamId)) occupiedWeeks.set(resolved.awayTeamId, new Set<number>());
    occupiedWeeks.get(resolved.homeTeamId)?.add(week);
    occupiedWeeks.get(resolved.awayTeamId)?.add(week);

    if (!venueByTeam.has(resolved.homeTeamId)) venueByTeam.set(resolved.homeTeamId, []);
    if (!venueByTeam.has(resolved.awayTeamId)) venueByTeam.set(resolved.awayTeamId, []);
    venueByTeam.get(resolved.homeTeamId)?.push({ week, venue: 'H' });
    venueByTeam.get(resolved.awayTeamId)?.push({ week, venue: 'A' });
  }

  await prisma.schedule.deleteMany({ where: { season } });
  for (const e of scheduledEntries) {
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
  for (const id of teamIds) gamesPerTeam[id] = currentCounts.get(id) ?? 0;
  const outlierTeams = teamIds.filter((id) => gamesPerTeam[id] < 28 || gamesPerTeam[id] > 33);

  return {
    totalGames: scheduledEntries.length,
    gamesPerTeam,
    conflicts: detectConflicts(scheduledEntries),
    outlierTeams,
  };
}
