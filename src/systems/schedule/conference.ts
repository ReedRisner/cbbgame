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

function targetGamesBySize(size: number): number {
  if (size <= 12) return (size - 1) * 2;
  if (size <= 14) return 18;
  return 20;
}

export async function generateConferenceSchedule(conferenceId: number, season: number): Promise<ScheduleEntry[]> {
  const teams = await prisma.team.findMany({ where: { conferenceId }, orderBy: { id: 'asc' } });
  const n = teams.length;
  const target = targetGamesBySize(n);
  const entries: ScheduleEntry[] = [];
  const counts = new Map<number, number>();

  for (const t of teams) counts.set(t.id, 0);

  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      const a = teams[i].id;
      const b = teams[j].id;
      const week = 5 + ((i + j) % 24);
      entries.push({ season, week, homeTeamId: a, awayTeamId: b, conferenceId, isConferenceGame: true, isTournamentGame: false });
      counts.set(a, (counts.get(a) ?? 0) + 1);
      counts.set(b, (counts.get(b) ?? 0) + 1);

      if (n <= 12) {
        entries.push({ season, week: Math.min(30, week + 8), homeTeamId: b, awayTeamId: a, conferenceId, isConferenceGame: true, isTournamentGame: false });
        counts.set(a, (counts.get(a) ?? 0) + 1);
        counts.set(b, (counts.get(b) ?? 0) + 1);
      }
    }
  }

  if (n > 12) {
    const ids = teams.map((t) => t.id);
    let guard = 0;
    while (guard < 5000 && ids.some((id) => (counts.get(id) ?? 0) < target)) {
      guard += 1;
      const a = ids[Math.floor(Math.random() * ids.length)];
      const b = ids[Math.floor(Math.random() * ids.length)];
      if (a === b) continue;
      if ((counts.get(a) ?? 0) >= target || (counts.get(b) ?? 0) >= target) continue;
      const week = 5 + ((guard + a + b) % 24);
      entries.push({ season, week, homeTeamId: a, awayTeamId: b, conferenceId, isConferenceGame: true, isTournamentGame: false });
      counts.set(a, (counts.get(a) ?? 0) + 1);
      counts.set(b, (counts.get(b) ?? 0) + 1);
    }
  }

  return entries;
}
