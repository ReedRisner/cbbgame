import { prisma } from '../../api/routes/_db';
import { calculateDesiredSOS } from '../../formulas/schedule';
import type { ScheduleEntry } from './conference';

export async function generateNonConferenceSchedule(season: number): Promise<ScheduleEntry[]> {
  const teams = await prisma.team.findMany({ include: { conference: true, coaches: true } });
  const entries: ScheduleEntry[] = [];
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];

  for (let i = 0; i < teams.length; i += 2) {
    const a = teams[i];
    const b = teams[(i + 1) % teams.length];
    if (a.conferenceId === b.conferenceId) continue;
    const ambitionA = a.coaches[0]?.ambition ?? 50;
    const desired = calculateDesiredSOS(a.conference.prestige, a.currentPrestige, ambitionA);
    const games = desired > 70 ? 13 : desired < 40 ? 10 : 11;
    for (let g = 0; g < Math.min(games, 6); g += 1) {
      const week = weeks[(i + g) % weeks.length];
      const homeA = g % 3 !== 2;
      entries.push({
        season,
        week,
        homeTeamId: homeA ? a.id : b.id,
        awayTeamId: homeA ? b.id : a.id,
        isConferenceGame: false,
        isTournamentGame: false,
      });
    }
  }

  return entries;
}
