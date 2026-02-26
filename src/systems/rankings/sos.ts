import { prisma } from '../../api/routes/_db';
import { calculateSOS } from '../../formulas/rankings';

export async function calculateAllSOS(season: number, week: number): Promise<void> {
  const teams = await prisma.team.findMany();
  const base = new Map<number, number>();
  const current = new Map<number, number>();

  for (const t of teams) {
    const games = await prisma.gameLog.findMany({ where: { season, OR: [{ homeTeamId: t.id }, { awayTeamId: t.id }] } });
    const oppIds = games.map((g) => (g.homeTeamId === t.id ? g.awayTeamId : g.homeTeamId));
    const oppRatings = await prisma.team.findMany({ where: { id: { in: oppIds.length ? oppIds : [-1] } } });
    const avgOppRating = oppRatings.length ? oppRatings.reduce((s, o) => s + o.currentPrestige, 0) / oppRatings.length : 50;
    const avgOppWinPct = 50;
    const seed = (0.60 * avgOppRating) + (0.25 * avgOppWinPct);
    base.set(t.id, seed);
    current.set(t.id, seed);
  }

  for (let i = 0; i < 4; i += 1) {
    const next = new Map<number, number>();
    for (const t of teams) {
      const games = await prisma.gameLog.findMany({ where: { season, OR: [{ homeTeamId: t.id }, { awayTeamId: t.id }] } });
      const oppIds = games.map((g) => (g.homeTeamId === t.id ? g.awayTeamId : g.homeTeamId));
      const avgOppSOS = oppIds.length ? oppIds.reduce((s, id) => s + (current.get(id) ?? 50), 0) / oppIds.length : 50;
      next.set(t.id, calculateSOS((base.get(t.id) ?? 0) / 0.60, 50, avgOppSOS));
    }
    for (const [k, v] of next) current.set(k, v);
  }

  const values = [...current.values()];
  const min = Math.min(...values);
  const max = Math.max(...values);

  for (const t of teams) {
    const norm = ((current.get(t.id) ?? 50) - min) / Math.max(1, max - min) * 100;
    const existing = await prisma.seasonRecord.findFirst({ where: { season, teamId: t.id } });
    if (existing) await prisma.seasonRecord.update({ where: { id: existing.id }, data: { sos: norm } });
    else await prisma.seasonRecord.create({ data: { season, teamId: t.id, wins: 0, losses: 0, conferenceWins: 0, conferenceLosses: 0, tournamentWins: 0, sos: norm } });
  }
}

export async function getTeamSOS(teamId: number, season: number, _week: number): Promise<number> {
  const record = await prisma.seasonRecord.findFirst({ where: { season, teamId } });
  return record?.sos ?? 50;
}
