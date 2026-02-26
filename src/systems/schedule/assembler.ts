import { prisma } from '../../api/routes/_db';
import { generateConferenceSchedule, type ScheduleEntry } from './conference';
import { generateMTEs, assignTeamsToMTEs } from './mte';
import { generateNonConferenceSchedule } from './nonConference';

const TARGET_GAMES_PER_TEAM = 32;
const REGULAR_SEASON_WEEKS = Array.from({ length: 40 }, (_, i) => i + 1);

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

function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
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

function isStreakValid(existing: Array<{ week: number; venue: 'H' | 'A' }>, candidate: { week: number; venue: 'H' | 'A' }): boolean {
  const MAX_HOME_AWAY_STREAK = 2;
  const ordered = [...existing, candidate].sort((a, b) => a.week - b.week);
  let streak = 1;
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].venue === ordered[i - 1].venue) {
      streak += 1;
      if (streak > MAX_HOME_AWAY_STREAK) return false;
    } else {
      streak = 1;
    }
  }
  return true;
}

function chooseWeek(
  homeTeamId: number,
  awayTeamId: number,
  occupiedWeeks: Map<number, Set<number>>,
  venuesByTeam: Map<number, Array<{ week: number; venue: 'H' | 'A' }>>,
  enforceStreak: boolean,
): number | null {
  for (const week of REGULAR_SEASON_WEEKS) {
    const hOcc = occupiedWeeks.get(homeTeamId) ?? new Set<number>();
    const aOcc = occupiedWeeks.get(awayTeamId) ?? new Set<number>();
    if (hOcc.has(week) || aOcc.has(week)) continue;

    if (enforceStreak) {
      const hVenues = venuesByTeam.get(homeTeamId) ?? [];
      const aVenues = venuesByTeam.get(awayTeamId) ?? [];
      if (!isStreakValid(hVenues, { week, venue: 'H' })) continue;
      if (!isStreakValid(aVenues, { week, venue: 'A' })) continue;
    }
    return week;
  }
  return null;
}

export async function generateFullSchedule(season: number): Promise<ScheduleSummary> {
  await generateMTEs(season);
  await assignTeamsToMTEs(season);

  const teams = await prisma.team.findMany({ select: { id: true, conferenceId: true } });
  const teamIds = teams.map((t) => t.id);
  const conferenceByTeam = new Map(teams.map((t) => [t.id, t.conferenceId]));

  const conferences = await prisma.conference.findMany({ select: { id: true } });
  const conferenceEntries: ScheduleEntry[] = [];
  for (const conf of conferences) {
    conferenceEntries.push(...await generateConferenceSchedule(conf.id, season));
  }

  const mteParticipants = await prisma.mteParticipant.findMany({ include: { mte: true }, where: { mte: { season } } });
  const mteTeams = new Set<number>(mteParticipants.map((p) => p.teamId));
  const conferenceCounts = new Map<number, number>();
  for (const e of conferenceEntries) {
    conferenceCounts.set(e.homeTeamId, (conferenceCounts.get(e.homeTeamId) ?? 0) + 1);
    conferenceCounts.set(e.awayTeamId, (conferenceCounts.get(e.awayTeamId) ?? 0) + 1);
  }

  const nonConferenceEntries = await generateNonConferenceSchedule({
    season,
    existingGamesByTeam: conferenceCounts,
    mteTeams,
  });

  const candidateEntries = [...conferenceEntries, ...nonConferenceEntries];

  const scheduledEntries: ScheduleEntry[] = [];
  const gamesPerTeam = new Map<number, number>(teamIds.map((id) => [id, 0]));
  const occupiedWeeks = new Map<number, Set<number>>();
  const venuesByTeam = new Map<number, Array<{ week: number; venue: 'H' | 'A' }>>();
  const pairCounts = new Map<string, number>();

  const addScheduledGame = (entry: Omit<ScheduleEntry, 'week'>, enforceStreak = true): boolean => {
    if ((gamesPerTeam.get(entry.homeTeamId) ?? 0) >= TARGET_GAMES_PER_TEAM) return false;
    if ((gamesPerTeam.get(entry.awayTeamId) ?? 0) >= TARGET_GAMES_PER_TEAM) return false;

    const week = chooseWeek(entry.homeTeamId, entry.awayTeamId, occupiedWeeks, venuesByTeam, enforceStreak);
    if (!week) return false;

    scheduledEntries.push({ ...entry, week });
    gamesPerTeam.set(entry.homeTeamId, (gamesPerTeam.get(entry.homeTeamId) ?? 0) + 1);
    gamesPerTeam.set(entry.awayTeamId, (gamesPerTeam.get(entry.awayTeamId) ?? 0) + 1);

    if (!occupiedWeeks.has(entry.homeTeamId)) occupiedWeeks.set(entry.homeTeamId, new Set<number>());
    if (!occupiedWeeks.has(entry.awayTeamId)) occupiedWeeks.set(entry.awayTeamId, new Set<number>());
    occupiedWeeks.get(entry.homeTeamId)?.add(week);
    occupiedWeeks.get(entry.awayTeamId)?.add(week);

    if (!venuesByTeam.has(entry.homeTeamId)) venuesByTeam.set(entry.homeTeamId, []);
    if (!venuesByTeam.has(entry.awayTeamId)) venuesByTeam.set(entry.awayTeamId, []);
    venuesByTeam.get(entry.homeTeamId)?.push({ week, venue: 'H' });
    venuesByTeam.get(entry.awayTeamId)?.push({ week, venue: 'A' });

    const pKey = pairKey(entry.homeTeamId, entry.awayTeamId);
    pairCounts.set(pKey, (pairCounts.get(pKey) ?? 0) + 1);
    return true;
  };

  // Pass 1: schedule all candidates while respecting 32-game cap.
  for (const e of candidateEntries) {
    addScheduledGame({
      season,
      homeTeamId: e.homeTeamId,
      awayTeamId: e.awayTeamId,
      conferenceId: e.conferenceId,
      isConferenceGame: e.isConferenceGame,
      isTournamentGame: e.isTournamentGame,
      neutralSite: e.neutralSite,
      mteId: e.mteId,
    });
  }

  // Pass 2: fill all teams up to exactly 32 with additional games.
  let guard = 0;
  while (guard < 300_000 && teamIds.some((id) => (gamesPerTeam.get(id) ?? 0) < TARGET_GAMES_PER_TEAM)) {
    guard += 1;
    const needTeams = teamIds
      .filter((id) => (gamesPerTeam.get(id) ?? 0) < TARGET_GAMES_PER_TEAM)
      .sort((a, b) => (gamesPerTeam.get(a) ?? 0) - (gamesPerTeam.get(b) ?? 0));

    if (needTeams.length < 2) break;
    let added = false;
    for (const a of needTeams) {
      const opponents = needTeams.filter((id) => id !== a && (gamesPerTeam.get(id) ?? 0) < TARGET_GAMES_PER_TEAM);
      for (const b of opponents) {
        // Prefer cross-conference but allow same-conference if needed to hit 32.
        // (No hard filter here: strict filtering can strand teams below 32.)
        const _preferCrossConference = conferenceByTeam.get(b) !== conferenceByTeam.get(a);
        void _preferCrossConference;

        const homeA = (gamesPerTeam.get(a) ?? 0) <= (gamesPerTeam.get(b) ?? 0);
        const success = addScheduledGame({
          season,
          homeTeamId: homeA ? a : b,
          awayTeamId: homeA ? b : a,
          isConferenceGame: false,
          isTournamentGame: false,
        }, false);

        if (success) {
          added = true;
          break;
        }
      }
      if (added) break;
    }

    if (!added) break;
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

  const gamesPerTeamObj: Record<number, number> = {};
  for (const id of teamIds) gamesPerTeamObj[id] = gamesPerTeam.get(id) ?? 0;
  const outlierTeams = teamIds.filter((id) => gamesPerTeamObj[id] !== TARGET_GAMES_PER_TEAM);

  return {
    totalGames: scheduledEntries.length,
    gamesPerTeam: gamesPerTeamObj,
    conflicts: detectConflicts(scheduledEntries),
    outlierTeams,
  };
}
