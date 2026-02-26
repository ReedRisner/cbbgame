import { prisma } from '../../api/routes/_db';
import { buildNCAATournamentBracket } from './bracket';
import { simulateConfTournament } from './confTournament';
import { selectAndSimulateCBI, selectAndSimulateCIT, selectAndSimulateNIT } from './nit';
import { simulateFullNCAATournament } from './ncaaTournament';
import { runNCAATournamentSelection } from './selection';

export type PostseasonSummary = {
  season: number;
  autoBids: number;
  ncaaChampion: number;
  failedConferenceTournaments: Array<{ conferenceId: number; reason: string }>;
  warnings: string[];
};

export async function runFullPostseason(season: number): Promise<PostseasonSummary> {
  const warnings: string[] = [];
  const failedConferenceTournaments: Array<{ conferenceId: number; reason: string }> = [];

  const conferences = await prisma.conference.findMany();
  for (const c of conferences) {
    try {
      const result = await simulateConfTournament(c.id, season);
      if (result.skipped) {
        failedConferenceTournaments.push({ conferenceId: c.id, reason: result.reason ?? 'No winner generated' });
      }
    } catch (error) {
      failedConferenceTournaments.push({
        conferenceId: c.id,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const selection = await runNCAATournamentSelection(season);
  warnings.push(...selection.warnings);
  await buildNCAATournamentBracket(selection, season);
  const ncaa = await simulateFullNCAATournament(season);
  await selectAndSimulateNIT(season);
  await selectAndSimulateCBI(season);
  await selectAndSimulateCIT(season);

  return {
    season,
    autoBids: selection.autoBids.length,
    ncaaChampion: ncaa.championTeamId,
    failedConferenceTournaments,
    warnings,
  };
}
