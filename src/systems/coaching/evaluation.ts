import { prisma } from '../../api/routes/_db';
import { applyBuyout, calculateBuyout } from './buyout';
import { runAssistantPoaching } from './poaching';
import { runEndOfSeasonFirings } from './firing';
import { runAllHiring } from './hiring';
import { runAllCoachDevelopment } from './development';

export async function runEndOfSeasonCoachingCycle(season: number): Promise<{ fired: number; hired: number; poached: number; buyouts: number }> {
  const firings = await runEndOfSeasonFirings(season);
  let buyouts = 0;
  for (const coachId of firings.firedCoachIds) {
    const coach = await prisma.coach.findUniqueOrThrow({ where: { id: coachId } });
    const amount = await calculateBuyout(coachId);
    buyouts += amount;
    await prisma.coachingBuyout.create({ data: { coachId, teamId: coach.teamId, season, buyoutAmount: amount, budgetImpactYears: amount > 2_000_000 ? 3 : 2, remainingImpact: amount } });
    await applyBuyout(coach.teamId, amount);
  }
  const hirings = await runAllHiring(season);
  const poached = await runAssistantPoaching(season);
  await runAllCoachDevelopment(season);
  return { fired: firings.firedCoachIds.length, hired: hirings.hired, poached, buyouts };
}
