import { prisma } from '../../api/routes/_db';
import { calculateBuyout as formulaBuyout } from '../../formulas/coaching';

export async function calculateBuyout(coachId: number): Promise<number> {
  const coach = await prisma.coach.findUniqueOrThrow({ where: { id: coachId } });
  return formulaBuyout(coach.salary, coach.contractYears);
}

export async function applyBuyout(teamId: number, amount: number): Promise<void> {
  const years = amount > 2_000_000 ? 3 : 2;
  await prisma.team.update({ where: { id: teamId }, data: { boosterBudget: { decrement: amount / years } } });
}
