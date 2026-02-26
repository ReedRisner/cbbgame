import { prisma } from '../../api/routes/_db';
import { normalRandom } from '../../utils/random';
import { calculateSocialMediaDelta } from '../../formulas/nil';

export async function updateSocialMedia(playerId: number, season: number): Promise<number> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId }, include: { team: true } });
  const delta = calculateSocialMediaDelta({
    per: 15,
    overallProxy: player.trueOverall,
    mediaMarket: player.team.mediaMarket,
    viralRoll: Math.random(),
    viralBoost: normalRandom(10, 3),
    isSeasonOne: season === 1,
  });
  const updated = Math.max(1, Math.min(99, player.socialMediaRating + delta));
  await prisma.player.update({ where: { id: playerId }, data: { socialMediaRating: updated } });
  return updated;
}

export async function runAnnualSocialMediaUpdates(season: number): Promise<void> {
  const players = await prisma.player.findMany({ select: { id: true } });
  for (const p of players) {
    await updateSocialMedia(p.id, season);
  }
}
