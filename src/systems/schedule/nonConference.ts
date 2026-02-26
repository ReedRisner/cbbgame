import { prisma } from '../../api/routes/_db';
import { calculateDesiredSOS } from '../../formulas/schedule';
import type { ScheduleEntry } from './conference';

export type NonConferenceOptions = {
  season: number;
  existingGamesByTeam?: Map<number, number>;
  mteTeams?: Set<number>;
};

export async function generateNonConferenceSchedule(options: NonConferenceOptions | number): Promise<ScheduleEntry[]> {
  const season = typeof options === 'number' ? options : options.season;
  const existingGamesByTeam = typeof options === 'number' ? new Map<number, number>() : (options.existingGamesByTeam ?? new Map<number, number>());
  const mteTeams = typeof options === 'number' ? new Set<number>() : (options.mteTeams ?? new Set<number>());

  const teams = await prisma.team.findMany({ include: { conference: true, coaches: true } });
  const entries: ScheduleEntry[] = [];

  const desiredTotalNonConf = new Map<number, number>();
  for (const team of teams) {
    const ambition = team.coaches[0]?.overall ?? 50;
    const desiredSOS = calculateDesiredSOS(team.conference.prestige, team.currentPrestige, ambition);
    const base = desiredSOS > 70 ? 13 : desiredSOS < 40 ? 10 : 11;
    const mteDeduction = mteTeams.has(team.id) ? 3 : 0;
    desiredTotalNonConf.set(team.id, Math.max(7, base - mteDeduction));
  }

  const nonConfPlayed = new Map<number, number>(teams.map((t) => [t.id, 0]));
  const pairUsed = new Set<string>();

  const addGame = (homeTeamId: number, awayTeamId: number): boolean => {
    const h = teams.find((t) => t.id === homeTeamId);
    const a = teams.find((t) => t.id === awayTeamId);
    if (!h || !a) return false;
    if (h.conferenceId === a.conferenceId) return false;

    const key = homeTeamId < awayTeamId ? `${homeTeamId}-${awayTeamId}` : `${awayTeamId}-${homeTeamId}`;
    if (pairUsed.has(key)) return false;

    if ((nonConfPlayed.get(homeTeamId) ?? 0) >= (desiredTotalNonConf.get(homeTeamId) ?? 10)) return false;
    if ((nonConfPlayed.get(awayTeamId) ?? 0) >= (desiredTotalNonConf.get(awayTeamId) ?? 10)) return false;

    pairUsed.add(key);
    nonConfPlayed.set(homeTeamId, (nonConfPlayed.get(homeTeamId) ?? 0) + 1);
    nonConfPlayed.set(awayTeamId, (nonConfPlayed.get(awayTeamId) ?? 0) + 1);
    entries.push({
      season,
      week: 0,
      homeTeamId,
      awayTeamId,
      isConferenceGame: false,
      isTournamentGame: false,
    });
    return true;
  };

  let guard = 0;
  while (guard < 100_000) {
    guard += 1;
    const need = teams
      .filter((t) => (nonConfPlayed.get(t.id) ?? 0) < (desiredTotalNonConf.get(t.id) ?? 10))
      .sort((a, b) => ((desiredTotalNonConf.get(b.id) ?? 10) - (nonConfPlayed.get(b.id) ?? 0)) - ((desiredTotalNonConf.get(a.id) ?? 10) - (nonConfPlayed.get(a.id) ?? 0)));

    if (need.length < 2) break;
    const a = need[0];
    const b = need.find((cand) => cand.id !== a.id && cand.conferenceId !== a.conferenceId);
    if (!b) break;

    const homeA = ((existingGamesByTeam.get(a.id) ?? 0) + (nonConfPlayed.get(a.id) ?? 0)) <= ((existingGamesByTeam.get(b.id) ?? 0) + (nonConfPlayed.get(b.id) ?? 0));
    addGame(homeA ? a.id : b.id, homeA ? b.id : a.id);
  }

  return entries;
}
