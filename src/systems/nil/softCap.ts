import { prisma } from '../../api/routes/_db';
import { calculateNILRecruitingImpact as calculateNILRecruitingImpactFormula, enforceNILSoftCapFormula } from '../../formulas/nil';

export async function enforceNILSoftCap(teamId: number, proposedValue: number): Promise<{ allowed: boolean; maxAllowed: number }> {
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
  return enforceNILSoftCapFormula(team.annualNilBudget, proposedValue);
}

export function calculateNILRecruitingImpact(offer: number, recruitStarTier: number): number {
  const median = Math.max(50_000, recruitStarTier * 175_000);
  return calculateNILRecruitingImpactFormula(offer, median);
}
