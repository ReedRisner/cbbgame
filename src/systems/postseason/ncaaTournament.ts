import { prisma } from '../../api/routes/_db';
import { calculateCinderellaFactor } from '../../formulas/postseason';

export type RoundResult = { game: string; winnerTeamId: number; loserTeamId: number };
export type TournamentResult = { championTeamId: number; rounds: string[] };

export async function simulateNCAATournamentRound(season: number, round: string): Promise<RoundResult[]> {
  const entries = await prisma.ncaaTournament.findMany({ where: { season, roundEliminated: null }, orderBy: { seed: 'asc' } });
  const out: RoundResult[] = [];
  for (let i = 0; i + 1 < entries.length; i += 2) {
    const a = entries[i];
    const b = entries[i + 1];
    const cinderellaBoost = a.seed >= 10 ? (calculateCinderellaFactor(65, 70, 60, 68, 0.5) > 65 ? 5 : 0) : 0;
    const aScore = (100 - a.seed) + cinderellaBoost + Math.random() * 10;
    const bScore = (100 - b.seed) + Math.random() * 10;
    const winner = aScore >= bScore ? a : b;
    const loser = winner.id === a.id ? b : a;
    out.push({ game: `${round}-${i / 2 + 1}`, winnerTeamId: winner.teamId, loserTeamId: loser.teamId });
    await prisma.ncaaTournament.update({ where: { id: loser.id }, data: { roundEliminated: round === 'R64' ? 'R64' : round as any } });
  }
  return out;
}

export async function simulateFullNCAATournament(season: number): Promise<TournamentResult> {
  const rounds = ['R64', 'R32', 'S16', 'E8', 'F4', 'CG'];
  for (const r of rounds) await simulateNCAATournamentRound(season, r);
  const alive = await prisma.ncaaTournament.findMany({ where: { season, roundEliminated: null } });
  const champion = alive[0];
  if (champion) {
    await prisma.ncaaTournament.update({ where: { id: champion.id }, data: { roundEliminated: 'CHAMPION' } });
    await prisma.postseasonResult.upsert({ where: { season_teamId_tournament: { season, teamId: champion.teamId, tournament: 'NCAA' } }, update: { result: 'Champion' }, create: { season, teamId: champion.teamId, tournament: 'NCAA', result: 'Champion' } });
  }
  return { championTeamId: champion?.teamId ?? 0, rounds };
}
