import { prisma } from '../../api/routes/_db';
import { calculatePlayerNILValueFormula } from '../../formulas/nil';

export async function calculatePlayerNILValue(playerId: number): Promise<number> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId }, include: { team: true } });
  const performanceScore = player.trueOverall;
  const positionAppeal = ['PG', 'SG'].includes(player.position) ? 75 : ['SF'].includes(player.position) ? 65 : 55;
  const personalityAppeal = (player.leadership + player.competitiveness) / 2;
  const marketAppeal = (player.team.mediaMarket + positionAppeal + personalityAppeal) / 3;
  const internationalDiscount = player.country === 'USA' ? 1 : 0.7;

  return calculatePlayerNILValueFormula({
    performanceScore,
    socialMediaRating: player.socialMediaRating,
    marketAppeal,
    teamPrestige: player.team.currentPrestige,
    internationalDiscount,
  });
}

export async function recalculateAllPlayerNILValues(_season: number): Promise<void> {
  const players = await prisma.player.findMany({ select: { id: true } });
  for (const player of players) {
    const value = await calculatePlayerNILValue(player.id);
    await prisma.player.update({ where: { id: player.id }, data: { socialMediaRating: Math.max(1, value) } });
  }
}
