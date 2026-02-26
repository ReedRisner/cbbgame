import { prisma } from '../api/routes/_db';
import { calculateHomeCourtAdvantage as formulaHca } from '../formulas/simulation';

const altitudeTeams = new Set(['BYU', 'Air Force', 'Colorado', 'Wyoming']);

export async function calculateHomeCourtAdvantage(homeTeamId: number, neutralSite: boolean): Promise<number> {
  if (neutralSite) return 0;
  const team = await prisma.team.findUniqueOrThrow({ where: { id: homeTeamId } });
  const altitude = altitudeTeams.has(team.name) ? 1 : 0;
  return formulaHca(team.fanIntensity, altitude);
}
