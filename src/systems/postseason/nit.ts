import { prisma } from '../../api/routes/_db';

export type PostseasonResult = { tournament: 'NIT' | 'CBI' | 'CIT'; teams: number[] };

async function selectTournament(season: number, tournament: 'NIT' | 'CBI' | 'CIT', take: number, skip: number): Promise<PostseasonResult> {
  const ncaa = await prisma.ncaaTournament.findMany({ where: { season } });
  const excluded = new Set(ncaa.map((n) => n.teamId));
  const board = await prisma.bracketology.findMany({ where: { season }, orderBy: [{ week: 'desc' }, { resumeScore: 'desc' }] });
  const teams = board.map((b) => b.teamId).filter((id, idx, arr) => arr.indexOf(id) === idx && !excluded.has(id)).slice(skip, skip + take);
  for (const [i, teamId] of teams.entries()) {
    await prisma.postseasonResult.upsert({ where: { season_teamId_tournament: { season, teamId, tournament: tournament as any } }, update: { result: 'Participant' }, create: { season, teamId, tournament: tournament as any, result: 'Participant' } });
    if (tournament === 'NIT') await prisma.nitTournament.upsert({ where: { season_teamId: { season, teamId } }, update: { seed: (i % 8) + 1 }, create: { season, teamId, seed: (i % 8) + 1 } });
  }
  return { tournament, teams };
}

export async function selectAndSimulateNIT(season: number): Promise<PostseasonResult> { return selectTournament(season, 'NIT', 32, 0); }
export async function selectAndSimulateCBI(season: number): Promise<PostseasonResult> { return selectTournament(season, 'CBI', 16, 32); }
export async function selectAndSimulateCIT(season: number): Promise<PostseasonResult> { return selectTournament(season, 'CIT', 16, 48); }
