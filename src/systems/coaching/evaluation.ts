import { runAssistantPoaching } from './poaching';
import { runEndOfSeasonFirings } from './firing';
import { runAllHiring } from './hiring';
import { runAllCoachDevelopment } from './development';

export async function runEndOfSeasonCoachingCycle(season: number): Promise<{ fired: number; hired: number; poached: number }> {
  const firings = await runEndOfSeasonFirings(season);
  const hirings = await runAllHiring(season);
  const poached = await runAssistantPoaching(season);
  await runAllCoachDevelopment(season);
  return { fired: firings.firedCoachIds.length, hired: hirings.hired, poached };
}
