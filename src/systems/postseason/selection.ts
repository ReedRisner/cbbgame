import { prisma } from '../../api/routes/_db';

export type SelectionResult = {
  autoBids: number[];
  atLarge: number[];
  field: number[];
  lastFourIn: number[];
  firstFourOut: number[];
  warnings: string[];
};

export async function runNCAATournamentSelection(season: number): Promise<SelectionResult> {
  const warnings: string[] = [];
  const autoBids = (await prisma.postseasonResult.findMany({ where: { season, tournament: 'CONF_TOURNEY', result: 'Champion' } }))
    .map((r) => r.teamId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx);

  const rows = await prisma.bracketology.findMany({ where: { season }, orderBy: [{ week: 'desc' }, { resumeScore: 'desc' }] });
  const candidates = rows
    .map((r) => r.teamId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx && !autoBids.includes(id));

  const cappedAutoBids = autoBids.slice(0, 32);
  if (cappedAutoBids.length < 32) {
    warnings.push(`Expected 32 auto-bids but found ${cappedAutoBids.length}; filling field from at-large pool.`);
  }

  const atLargeSpots = Math.max(0, 68 - cappedAutoBids.length);
  const atLarge = candidates.slice(0, atLargeSpots);
  const field = [...cappedAutoBids, ...atLarge].slice(0, 68);

  const projectedAtLargeBoard = candidates.slice(0, 40);
  const lastFourIn = projectedAtLargeBoard.slice(Math.max(0, atLargeSpots - 4), atLargeSpots);
  const firstFourOut = projectedAtLargeBoard.slice(atLargeSpots, atLargeSpots + 4);

  return { autoBids: cappedAutoBids, atLarge, field, lastFourIn, firstFourOut, warnings };
}
