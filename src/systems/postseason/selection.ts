import { prisma } from '../../api/routes/_db';

export type SelectionResult = { autoBids: number[]; atLarge: number[]; field: number[]; lastFourIn: number[]; firstFourOut: number[] };

export async function runNCAATournamentSelection(season: number): Promise<SelectionResult> {
  const autoBids = (await prisma.postseasonResult.findMany({ where: { season, tournament: 'CONF_TOURNEY', result: 'Champion' } })).map((r) => r.teamId);
  const rows = await prisma.bracketology.findMany({ where: { season }, orderBy: [{ week: 'desc' }, { resumeScore: 'desc' }] });
  const candidates = rows.map((r) => r.teamId).filter((id, idx, arr) => arr.indexOf(id) === idx && !autoBids.includes(id));
  const atLarge = candidates.slice(0, 36);
  const field = [...autoBids.slice(0, 32), ...atLarge];
  return { autoBids: autoBids.slice(0, 32), atLarge, field, lastFourIn: atLarge.slice(32, 36), firstFourOut: candidates.slice(36, 40) };
}
