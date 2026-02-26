import { prisma } from '../../api/routes/_db';
import { isImmediatelyEligibleByCount } from '../../formulas/portal';

export async function isImmediatelyEligible(playerId: number): Promise<boolean> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  return isImmediatelyEligibleByCount(player.transferCount);
}
