import { prisma } from '../../api/routes/_db';

export type ScheduleEntry = {
  season: number;
  week: number;
  homeTeamId: number;
  awayTeamId: number;
  conferenceId?: number;
  isConferenceGame: boolean;
  isTournamentGame: boolean;
  neutralSite?: boolean;
  mteId?: number;
};

type Pair = { a: number; b: number; homeA: boolean };

function targetGamesBySize(size: number): number {
  if (size <= 12) return (size - 1) * 2;
  if (size <= 14) return 18;
  return 20;
}

function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export async function generateConferenceSchedule(conferenceId: number, season: number): Promise<ScheduleEntry[]> {
  const teams = await prisma.team.findMany({ where: { conferenceId }, orderBy: { id: 'asc' } });
  const teamIds = teams.map((t) => t.id);
  const n = teamIds.length;
  const target = targetGamesBySize(n);
  const entries: ScheduleEntry[] = [];
  const gamesByTeam = new Map<number, number>(teamIds.map((id) => [id, 0]));
  const pairGames = new Map<string, number>();

  const rivals = new Set<string>();
  for (const team of teams) {
    const rivalryList = (team.rivalries as Array<{ teamId?: number }> | null) ?? [];
    for (const r of rivalryList) {
      const rivalId = Number(r.teamId);
      if (!teamIds.includes(rivalId)) continue;
      rivals.add(pairKey(team.id, rivalId));
    }
  }

  const addGame = (homeTeamId: number, awayTeamId: number): boolean => {
    if (homeTeamId === awayTeamId) return false;
    const pKey = pairKey(homeTeamId, awayTeamId);
    const currentPairCount = pairGames.get(pKey) ?? 0;
    if (currentPairCount >= 2) return false;
    if ((gamesByTeam.get(homeTeamId) ?? 0) >= target || (gamesByTeam.get(awayTeamId) ?? 0) >= target) return false;

    entries.push({
      season,
      week: 0,
      homeTeamId,
      awayTeamId,
      conferenceId,
      isConferenceGame: true,
      isTournamentGame: false,
    });
    pairGames.set(pKey, currentPairCount + 1);
    gamesByTeam.set(homeTeamId, (gamesByTeam.get(homeTeamId) ?? 0) + 1);
    gamesByTeam.set(awayTeamId, (gamesByTeam.get(awayTeamId) ?? 0) + 1);
    return true;
  };

  // 1) Rivals guaranteed home-and-away.
  for (const key of rivals) {
    const [a, b] = key.split('-').map(Number);
    addGame(a, b);
    addGame(b, a);
  }

  // 2) Everyone gets at least one game versus everyone.
  for (let i = 0; i < teamIds.length; i += 1) {
    for (let j = i + 1; j < teamIds.length; j += 1) {
      const a = teamIds[i];
      const b = teamIds[j];
      const existing = pairGames.get(pairKey(a, b)) ?? 0;
      if (existing > 0) continue;
      const homeA = (a + b + season) % 2 === 0;
      addGame(homeA ? a : b, homeA ? b : a);
    }
  }

  // 3) Fill extras to hit target.
  let guard = 0;
  while (guard < 50_000 && teamIds.some((id) => (gamesByTeam.get(id) ?? 0) < target)) {
    guard += 1;
    const under = teamIds.filter((id) => (gamesByTeam.get(id) ?? 0) < target);
    if (under.length < 2) break;
    under.sort((x, y) => (gamesByTeam.get(x) ?? 0) - (gamesByTeam.get(y) ?? 0));
    const a = under[0];

    const candidates = under
      .slice(1)
      .filter((b) => (pairGames.get(pairKey(a, b)) ?? 0) < 2)
      .sort((x, y) => (pairGames.get(pairKey(a, x)) ?? 0) - (pairGames.get(pairKey(a, y)) ?? 0));

    const b = candidates[0];
    if (!b) continue;

    const homeA = ((gamesByTeam.get(a) ?? 0) + guard) % 2 === 0;
    addGame(homeA ? a : b, homeA ? b : a);
  }

  return entries;
}
