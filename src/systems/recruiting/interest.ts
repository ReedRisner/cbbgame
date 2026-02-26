import { prisma } from '../../api/routes/_db';
import {
  calculateInterestDelta as calculateInterestDeltaFormula,
  computePersonalityWeights,
  type InterestComponentInput,
} from '../../formulas/recruiting';
import { calculateNILRecruitingImpact } from '../../formulas/nil';
import { calculateNBATrackRecord } from './proDev';

export async function calculateInterestDelta(
  recruit: {
    personalityEgo: number;
    personalityLoyalty: number;
    nbaDraftInterest: number;
    personalityMaturity: number;
  },
  team: { currentPrestige: number; academicRating: number },
  context: InterestComponentInput & { recruitStarTier: number; nilOfferRaw: number },
): Promise<number> {
  const weights = computePersonalityWeights({
    ego: recruit.personalityEgo,
    loyalty: recruit.personalityLoyalty,
    nbaDraftInterest: recruit.nbaDraftInterest,
    maturity: recruit.personalityMaturity,
    academicAffinity: team.academicRating,
  });

  const normalizedNIL = calculateNILRecruitingImpact(context.nilOfferRaw, Math.max(1, context.recruitStarTier * 100_000));
  return calculateInterestDeltaFormula(weights, { ...context, nilOffer: normalizedNIL });
}

export async function recalculateRecruitInterestForTeam(recruitId: number, teamId: number, season: number, week: number): Promise<number> {
  const [recruit, team, coach, scouting] = await Promise.all([
    prisma.recruit.findUniqueOrThrow({ where: { id: recruitId } }),
    prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
    prisma.coach.findFirst({ where: { teamId, role: 'HEAD' } }),
    prisma.recruitScouting.findUnique({ where: { recruitId_teamId_season: { recruitId, teamId, season } } }),
  ]);

  const nbaTrack = await calculateNBATrackRecord(teamId, season);
  const delta = await calculateInterestDelta(recruit, team, {
    prestigeFactor: team.currentPrestige,
    distanceFactor: 50,
    ptProjection: 60,
    nilOffer: 0,
    nilOfferRaw: 0,
    coachCharisma: coach?.charisma ?? 50,
    playstyleFit: 50,
    coachDevReputation: coach?.development ?? 50,
    recentSuccess: team.tourneySuccessScore,
    recruitingEffort: (scouting?.investmentLevel ?? 0) * 100,
    nbaTrackRecord: nbaTrack,
    academicRating: team.academicRating,
    recruitStarTier: recruit.starRating,
  });

  const prior = await prisma.recruitInterest.findUnique({ where: { recruitId_teamId_season: { recruitId, teamId, season } } });
  const interestLevel = Math.max(0, Math.min(100, (prior?.interestLevel ?? 40) + delta / 15));
  await prisma.recruitInterest.upsert({
    where: { recruitId_teamId_season: { recruitId, teamId, season } },
    create: { recruitId, teamId, season, lastUpdatedWeek: week, interestLevel },
    update: { lastUpdatedWeek: week, interestLevel },
  });

  return interestLevel;
}
