import { runAPPoll } from './apPoll';
import { runBracketology } from './bracketology';
import { runCoachesPoll } from './coachesPoll';
import { calculateAllEfficiency } from './efficiency';
import { calculateAllNET } from './net';
import { calculateAllSOS } from './sos';

export type RankingsSummary = { season: number; week: number; steps: string[] };

export async function runWeeklyRankings(season: number, week: number): Promise<RankingsSummary> {
  await calculateAllSOS(season, week);
  await calculateAllEfficiency(season, week);
  await calculateAllNET(season, week);
  await runAPPoll(season, week);
  await runCoachesPoll(season, week);
  await runBracketology(season, week);
  return { season, week, steps: ['sos', 'efficiency', 'net', 'ap', 'coaches', 'bracketology'] };
}
