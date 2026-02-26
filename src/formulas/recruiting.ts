export type PersonalityInput = {
  ego: number;
  loyalty: number;
  nbaDraftInterest: number;
  maturity: number;
  academicAffinity: number;
};

export type RecruitingWeightSet = {
  prestige: number;
  proximity: number;
  playingTime: number;
  nil: number;
  coach: number;
  style: number;
  dev: number;
  win: number;
  relationship: number;
  proDev: number;
  academic: number;
};

const BASE_WEIGHTS: RecruitingWeightSet = {
  prestige: 0.11,
  proximity: 0.09,
  playingTime: 0.13,
  nil: 0.12,
  coach: 0.08,
  style: 0.08,
  dev: 0.10,
  win: 0.08,
  relationship: 0.09,
  proDev: 0.07,
  academic: 0.05,
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function normalizeWeights(weights: RecruitingWeightSet): RecruitingWeightSet {
  const sum = Object.values(weights).reduce((acc, value) => acc + value, 0);
  const divisor = sum > 0 ? sum : 1;
  return Object.fromEntries(
    Object.entries(weights).map(([key, value]) => [key, value / divisor]),
  ) as RecruitingWeightSet;
}

export function computePersonalityWeights(input: PersonalityInput): RecruitingWeightSet {
  const weights = { ...BASE_WEIGHTS };

  const egoFactor = input.ego / 100;
  const loyaltyFactor = input.loyalty / 100;
  const nbaFactor = input.nbaDraftInterest / 100;
  const academicsFactor = clamp01(((input.maturity + input.academicAffinity) / 2) / 100);

  weights.nil *= 1 + egoFactor * 0.6;
  weights.prestige *= 1 + egoFactor * 0.45;

  weights.proximity *= 1 + loyaltyFactor * 0.55;
  weights.relationship *= 1 + loyaltyFactor * 0.65;

  weights.dev *= 1 + nbaFactor * 0.85;
  weights.proDev *= 1 + nbaFactor * 1.1;

  weights.academic *= 1 + academicsFactor;

  return normalizeWeights(weights);
}

export type InterestComponentInput = {
  prestigeFactor: number;
  distanceFactor: number;
  ptProjection: number;
  nilOffer: number;
  coachCharisma: number;
  playstyleFit: number;
  coachDevReputation: number;
  recentSuccess: number;
  recruitingEffort: number;
  nbaTrackRecord: number;
  academicRating: number;
};

export function calculateInterestDelta(
  weights: RecruitingWeightSet,
  input: InterestComponentInput,
): number {
  return (
    weights.prestige * input.prestigeFactor +
    weights.proximity * input.distanceFactor +
    weights.playingTime * input.ptProjection +
    weights.nil * input.nilOffer +
    weights.coach * input.coachCharisma +
    weights.style * input.playstyleFit +
    weights.dev * input.coachDevReputation +
    weights.win * input.recentSuccess +
    weights.relationship * input.recruitingEffort +
    weights.proDev * input.nbaTrackRecord +
    weights.academic * input.academicRating
  );
}

export function calculateNBATrackRecord(input: {
  draftPicksLast5yr: number;
  lotteryPicksLast5yr: number;
  coachDevReputation: number;
  seasonOneProxyCoachDevSkill?: number;
  hasDraftHistory: boolean;
}): number {
  if (!input.hasDraftHistory && input.seasonOneProxyCoachDevSkill !== undefined) {
    return input.seasonOneProxyCoachDevSkill * 0.4;
  }

  return input.draftPicksLast5yr * 3 + input.lotteryPicksLast5yr * 5 + input.coachDevReputation * 0.2;
}

export function getProDevGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D+';
  return 'D';
}

export function scoutingUncertainty(input: {
  baseUncertainty: number;
  scoutingInvestment: number;
  positionFactor: number;
  geographyFactor: number;
}): number {
  const value = input.baseUncertainty * (1 - input.scoutingInvestment) * input.positionFactor * input.geographyFactor;
  return Math.max(3, Math.min(10, value));
}

export function getScoutedRange(scoutedOverall: number, uncertainty: number): { min: number; max: number } {
  return {
    min: Math.max(1, scoutedOverall - uncertainty),
    max: Math.min(99, scoutedOverall + uncertainty),
  };
}

export function calculateVisitBoost(input: {
  facilityRating: number;
  fanInterest: number;
  coachCharisma: number;
  isOfficial: boolean;
  week: number;
}): number {
  const officialVisitBoost =
    5 + input.facilityRating / 20 + input.fanInterest / 25 + input.coachCharisma / 30;
  const typeAdjusted = input.isOfficial ? officialVisitBoost : officialVisitBoost * 0.4;
  return input.week > 20 ? typeAdjusted * 1.3 : typeAdjusted;
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function commitmentProbability(topInterest: number, secondInterest: number): number {
  return sigmoid((topInterest - 80) / 5) * sigmoid((topInterest - secondInterest - 15) / 5);
}

export function decommitProbability(input: {
  loyalty: number;
  triggerMultiplier: number;
  baseDecommit?: number;
}): number {
  const base = input.baseDecommit ?? 0.03;
  return base * (1 - input.loyalty / 100) * input.triggerMultiplier;
}

export function recruitCompositeScore(input: {
  scoutedPotential: number;
  scoutedOverall: number;
  measurables: number;
  eventPerformance: number;
}): number {
  return (
    input.scoutedPotential * 0.4 +
    input.scoutedOverall * 0.35 +
    input.measurables * 0.15 +
    input.eventPerformance * 0.1
  );
}

export function starRatingFromComposite(composite: number): number {
  if (composite >= 91) return 5;
  if (composite >= 82) return 4;
  if (composite >= 72) return 3;
  if (composite >= 63) return 2;
  return 1;
}
