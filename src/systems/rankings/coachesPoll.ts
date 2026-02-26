import { prisma } from '../../api/routes/_db';
import { normalRandom } from '../../utils/random';
import { calculateCoachesPollScore } from '../../formulas/rankings';

export type CoachesPollResult = { rank: number; teamId: number; points: number; prevRank: number | null };

export async function runCoachesPoll(season: number, week: number): Promise<CoachesPollResult[]> {
  const ap = await prisma.apPoll.findMany({ where: { season, week } });
  const prev = await prisma.coachesPoll.findMany({ where: { season, week: Math.max(0, week - 1) } });
  const prevMap = new Map(prev.map((p) => [p.teamId, p.rank]));
  const ranked = ap.map((a) => ({ teamId: a.teamId, score: calculateCoachesPollScore(a.points, 3, a.rank >= 20 ? normalRandom(0, 4) : 0) + ((26 - (prevMap.get(a.teamId) ?? 26)) * 0.5) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  await prisma.coachesPoll.deleteMany({ where: { season, week } });
  const out: CoachesPollResult[] = [];
  for (let i = 0; i < ranked.length; i += 1) {
    const row = { rank: i + 1, teamId: ranked[i].teamId, points: Math.round((25 - i) * 52), prevRank: prevMap.get(ranked[i].teamId) ?? null };
    out.push(row);
    await prisma.coachesPoll.create({ data: { season, week, teamId: row.teamId, rank: row.rank, points: row.points, prevRank: row.prevRank } });
  }
  return out;
}
