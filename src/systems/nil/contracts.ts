import { prisma } from '../../api/routes/_db';
import { enforceNILSoftCap } from './softCap';
import { calculatePlayerNILValue } from './valuation';

export async function createNILContract(playerId: number, teamId: number, value: number, years: number, bonus: number) {
  const cap = await enforceNILSoftCap(teamId, value);
  if (!cap.allowed) {
    throw new Error(`Soft cap exceeded. Max allowed: ${cap.maxAllowed}`);
  }

  return prisma.nilContract.create({
    data: {
      playerId,
      teamId,
      season: 1,
      annualValue: value,
      years: Math.max(1, Math.min(4, years)),
      signingBonus: Math.min(value * 0.2, bonus),
      brandScore: 50,
      status: 'ACTIVE',
    },
  });
}

export async function voidContract(contractId: number, reason: string): Promise<void> {
  await prisma.nilContract.update({ where: { id: contractId }, data: { status: 'VOIDED', reason } });
}

export async function evaluateRenegotiation(contractId: number): Promise<boolean> {
  const contract = await prisma.nilContract.findUniqueOrThrow({ where: { id: contractId } });
  const value = await calculatePlayerNILValue(contract.playerId);
  const delta = Math.abs(value - contract.annualValue) / Math.max(1, contract.annualValue);
  if (delta < 0.15) return false;
  await prisma.nilContract.update({ where: { id: contractId }, data: { status: 'RENEGOTIATED' } });
  return true;
}

export async function runAINILAllocation(teamId: number, season: number): Promise<void> {
  const players = await prisma.player.findMany({ where: { teamId }, orderBy: { trueOverall: 'desc' }, take: 8 });
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
  let remaining = team.annualNilBudget;

  for (const [index, player] of players.entries()) {
    const share = index < 3 ? 0.12 : index < 5 ? 0.07 : 0.03;
    const annualValue = Math.min(remaining, team.annualNilBudget * share);
    if (annualValue <= 0) continue;
    remaining -= annualValue;

    await prisma.nilContract.create({
      data: {
        playerId: player.id,
        teamId,
        season,
        annualValue,
        years: index < 3 ? 2 : 1,
        signingBonus: annualValue * 0.1,
        brandScore: 50,
        status: 'ACTIVE',
      },
    });
  }
}
