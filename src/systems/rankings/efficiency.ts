import { prisma } from '../../api/routes/_db';
import { calculateAdjDefEff, calculateAdjOffEff } from '../../formulas/rankings';

export type EfficiencyResult = { teamId: number; adjOffEff: number; adjDefEff: number; overallRating: number; tempo: number };

export async function calculateAllEfficiency(season: number, week: number): Promise<void> {
  const teams = await prisma.team.findMany();
  await prisma.efficiencyRating.deleteMany({ where: { season, week } });

  for (const t of teams) {
    const games = await prisma.gameLog.findMany({ where: { season, OR: [{ homeTeamId: t.id }, { awayTeamId: t.id }] } });
    const scored = games.reduce((s, g) => s + (g.homeTeamId === t.id ? g.homeScore : g.awayScore), 0);
    const allowed = games.reduce((s, g) => s + (g.homeTeamId === t.id ? g.awayScore : g.homeScore), 0);
    const poss = Math.max(1, games.reduce((s, g) => s + g.pace, 0));
    const rawOff = (scored / poss) * 100;
    const rawDef = (allowed / poss) * 100;
    const adjOff = calculateAdjOffEff(rawOff, 100, 100);
    const adjDef = calculateAdjDefEff(rawDef, 100, 100);
    await prisma.efficiencyRating.create({ data: { season, week, teamId: t.id, adjOffEff: adjOff, adjDefEff: adjDef, overallRating: adjOff - adjDef, tempo: poss / Math.max(1, games.length) } });
  }
}

export async function getTeamEfficiency(teamId: number, season: number, week: number): Promise<EfficiencyResult | null> {
  return prisma.efficiencyRating.findUnique({ where: { season_week_teamId: { season, week, teamId } } });
}
