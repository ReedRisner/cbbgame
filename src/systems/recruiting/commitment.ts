import { prisma } from '../../api/routes/_db';
import { commitmentProbability, sigmoid } from '../../formulas/recruiting';

export type CommitResult = { recruitId: number; teamId: number; probability: number; forced: boolean };

export { sigmoid };

export async function evaluateCommitment(recruitId: number, season: number, week: number): Promise<CommitResult | null> {
  const recruit = await prisma.recruit.findUniqueOrThrow({ where: { id: recruitId } });
  if (recruit.signedTeamId) return null;

  const interests = await prisma.recruitInterest.findMany({ where: { recruitId, season }, orderBy: { interestLevel: 'desc' } });
  if (!interests.length) return null;

  const top = interests[0];
  const second = interests[1] ?? interests[0];
  let commitTeamId: number | null = null;
  let forced = false;

  if (top.interestLevel > 80 && top.interestLevel - second.interestLevel >= 15) {
    const prob = commitmentProbability(top.interestLevel, second.interestLevel);
    if (Math.random() < prob) commitTeamId = top.teamId;
  }

  if (!commitTeamId && week >= 34) {
    const above60 = interests.find((i) => i.interestLevel >= 60);
    commitTeamId = above60?.teamId ?? interests[Math.floor(Math.random() * Math.min(5, interests.length))].teamId;
    forced = true;
  }

  if (!commitTeamId) return null;

  await prisma.$transaction([
    prisma.recruit.update({ where: { id: recruitId }, data: { signedTeamId: commitTeamId } }),
    prisma.recruitOffer.upsert({
      where: { recruitId_teamId_season: { recruitId, teamId: commitTeamId, season } },
      create: { recruitId, teamId: commitTeamId, season, weekOffered: week, status: 'ACCEPTED' },
      update: { status: 'ACCEPTED' },
    }),
  ]);

  return { recruitId, teamId: commitTeamId, probability: commitmentProbability(top.interestLevel, second.interestLevel), forced };
}
