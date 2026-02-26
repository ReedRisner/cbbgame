import { prisma } from '../../api/routes/_db';
import { buildNCAATournamentBracket } from './bracket';
import { simulateConfTournament, } from './confTournament';
import { selectAndSimulateCBI, selectAndSimulateCIT, selectAndSimulateNIT } from './nit';
import { simulateFullNCAATournament } from './ncaaTournament';
import { runNCAATournamentSelection } from './selection';

export type PostseasonSummary = { season: number; autoBids: number; ncaaChampion: number };

export async function runFullPostseason(season: number): Promise<PostseasonSummary> {
  const conferences = await prisma.conference.findMany();
  for (const c of conferences) await simulateConfTournament(c.id, season);
  const selection = await runNCAATournamentSelection(season);
  await buildNCAATournamentBracket(selection, season);
  const ncaa = await simulateFullNCAATournament(season);
  await selectAndSimulateNIT(season);
  await selectAndSimulateCBI(season);
  await selectAndSimulateCIT(season);
  return { season, autoBids: selection.autoBids.length, ncaaChampion: ncaa.championTeamId };
}
