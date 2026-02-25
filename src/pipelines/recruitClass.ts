import { PrismaClient, Position, RecruitType } from '@prisma/client';
import { calculatePlayerOverall } from '../formulas/player';
import { recruitCompositeScore, scoutingUncertainty, starRatingFromComposite } from '../formulas/recruiting';
import { generateName } from '../utils/names';
import { clampedNormal, weightedChoice } from '../utils/random';

const geoWeights = [
  { city: 'New York', state: 'NY', country: 'USA', weight: 12, geographyFactor: 0.9 },
  { city: 'Philadelphia', state: 'PA', country: 'USA', weight: 11, geographyFactor: 0.9 },
  { city: 'Dallas', state: 'TX', country: 'USA', weight: 11, geographyFactor: 0.95 },
  { city: 'Houston', state: 'TX', country: 'USA', weight: 10, geographyFactor: 0.95 },
  { city: 'Los Angeles', state: 'CA', country: 'USA', weight: 10, geographyFactor: 1.0 },
  { city: 'Chicago', state: 'IL', country: 'USA', weight: 8, geographyFactor: 0.95 },
  { city: 'Indianapolis', state: 'IN', country: 'USA', weight: 7, geographyFactor: 0.9 },
  { city: 'Atlanta', state: 'GA', country: 'USA', weight: 8, geographyFactor: 0.9 },
  { city: 'Charlotte', state: 'NC', country: 'USA', weight: 6, geographyFactor: 1.0 },
  { city: 'Miami', state: 'FL', country: 'USA', weight: 5, geographyFactor: 1.05 },
  { city: 'Toronto', state: 'ON', country: 'Canada', weight: 4, geographyFactor: 1.2 },
  { city: 'Paris', state: 'IDF', country: 'France', weight: 3, geographyFactor: 1.3 }
];

function makeRecruit(idx: number, type: RecruitType, season: number) {
  const loc = weightedChoice(geoWeights, geoWeights.map((g) => g.weight));
  const position = weightedChoice<Position>(['PG', 'SG', 'SF', 'PF', 'C'], [22, 24, 22, 18, 14]);
  const { firstName, lastName } = generateName(12000 + idx);
  const physicalBoost = type === 'JUCO' ? 6 : type === 'INTERNATIONAL' ? 3 : 0;
  const base = clampedNormal(type === 'JUCO' ? 66 : 61, 11, 30, 96);
  const attrs = {
    speed: clampedNormal(base + (position === 'PG' ? 7 : 1) + physicalBoost, 9, 25, 99),
    acceleration: clampedNormal(base + (position === 'PG' ? 7 : 1) + physicalBoost, 9, 25, 99),
    strength: clampedNormal(base + (position === 'C' ? 8 : -1) + physicalBoost, 9, 25, 99),
    vertical: clampedNormal(base + 2 + physicalBoost, 10, 25, 99),
    stamina: clampedNormal(base + physicalBoost, 9, 25, 99),
    durability: clampedNormal(base + physicalBoost, 9, 25, 99),
    insideScoring: clampedNormal(base + (position === 'C' || position === 'PF' ? 6 : -2), 10, 25, 99),
    midRange: clampedNormal(base + (position === 'SG' ? 5 : 0), 10, 25, 99),
    threePoint: clampedNormal(base + (position === 'PG' || position === 'SG' ? 6 : -5), 10, 20, 99),
    freeThrow: clampedNormal(base + 3, 9, 25, 99),
    layup: clampedNormal(base + 2, 9, 25, 99),
    postMoves: clampedNormal(base + (position === 'C' ? 8 : -6), 10, 20, 99),
    ballHandling: clampedNormal(base + (position === 'PG' ? 9 : -3), 10, 20, 99),
    passing: clampedNormal(base + (position === 'PG' ? 8 : -2), 10, 20, 99),
    courtVision: clampedNormal(base + (position === 'PG' ? 8 : -2), 10, 20, 99),
    perimeterDefense: clampedNormal(base + (position === 'C' ? -8 : 2), 10, 20, 99),
    interiorDefense: clampedNormal(base + (position === 'C' || position === 'PF' ? 7 : -6), 10, 20, 99),
    steal: clampedNormal(base + (position === 'PG' ? 3 : -2), 10, 20, 99),
    block: clampedNormal(base + (position === 'C' ? 9 : -9), 10, 20, 99),
    rebounding: clampedNormal(base + (position === 'C' || position === 'PF' ? 8 : -5), 10, 20, 99),
    offensiveIQ: clampedNormal(base + 1, 10, 20, 99),
    defensiveIQ: clampedNormal(base + 1, 10, 20, 99),
    shotCreation: clampedNormal(base + (position === 'PG' || position === 'SG' ? 4 : -3), 10, 20, 99),
    pickAndRoll: clampedNormal(base + 2, 10, 20, 99)
  };

  const trueOverall = calculatePlayerOverall(position, attrs);
  const truePotential = clampedNormal(trueOverall + clampedNormal(9, 8, -2, 23), 8, trueOverall, 99);
  const baseUncertainty = type === 'INTERNATIONAL' ? 9 : type === 'JUCO' ? 4 : 6;
  const uncert = scoutingUncertainty({
    baseUncertainty,
    scoutingInvestment: 0.58,
    positionFactor: position === 'C' ? 1.1 : 1,
    geographyFactor: loc.geographyFactor * (type === 'INTERNATIONAL' ? 1.5 : 1)
  });

  const scoutedOverall = clampedNormal(trueOverall, uncert, 20, 99);
  const scoutedPotential = clampedNormal(truePotential, uncert, 20, 99);
  const measurablesScore = (attrs.speed + attrs.strength + attrs.vertical + attrs.stamina) / 4;
  const eventPerformance = clampedNormal((scoutedOverall + scoutedPotential) / 2, 10, 20, 99);
  const compositeScore = recruitCompositeScore({ scoutedPotential, scoutedOverall, measurables: measurablesScore, eventPerformance });

  return {
    season,
    type,
    firstName,
    lastName,
    hometown: loc.city,
    state: loc.state,
    country: loc.country,
    position,
    age: type === 'JUCO' ? Math.round(clampedNormal(20, 1, 19, 23)) : Math.round(clampedNormal(18, 1, 17, 21)),
    heightInches: Math.round(clampedNormal(position === 'PG' ? 74 : position === 'SG' ? 77 : position === 'SF' ? 79 : position === 'PF' ? 81 : 83, 2.4, 69, 89)),
    weight: Math.round(clampedNormal(position === 'PG' ? 185 : position === 'SG' ? 198 : position === 'SF' ? 215 : position === 'PF' ? 230 : 246, 16, 155, 315)),
    gpa: type === 'JUCO' ? clampedNormal(2.4, 0.25, 2.0, 2.8) : clampedNormal(3.0, 0.45, 2.0, 4.0),
    eligibilityYears: type === 'JUCO' ? 2 : 4,
    immediateEligibility: type === 'JUCO',
    visaDelayRisk: type === 'INTERNATIONAL' ? 0.05 : 0,
    nilDiscount: type === 'INTERNATIONAL' ? 0.7 : 1,
    uncertaintyMultiplier: type === 'INTERNATIONAL' ? 1.5 : type === 'JUCO' ? 0.75 : 1,
    ...attrs,
    shotTendency: clampedNormal(53, 14, 5, 99),
    driveTendency: clampedNormal(50, 15, 5, 99),
    passTendency: clampedNormal(51, 14, 5, 99),
    postTendency: clampedNormal(position === 'C' || position === 'PF' ? 64 : 34, 14, 5, 99),
    transitionTendency: clampedNormal(52, 15, 5, 99),
    foulTendency: clampedNormal(44, 14, 5, 99),
    hustleTendency: clampedNormal(62, 14, 5, 99),
    riskTendency: clampedNormal(47, 13, 5, 99),
    workEthic: clampedNormal(59, 14, 5, 99),
    leadership: clampedNormal(50, 15, 5, 99),
    coachability: clampedNormal(59, 14, 5, 99),
    discipline: clampedNormal(56, 15, 5, 99),
    loyalty: clampedNormal(54, 15, 5, 99),
    competitiveness: clampedNormal(62, 13, 5, 99),
    composure: clampedNormal(52, 14, 5, 99),
    trueOverall,
    truePotential,
    scoutedOverall,
    scoutedPotential,
    measurablesScore,
    eventPerformance,
    compositeScore,
    starRating: starRatingFromComposite(compositeScore)
  };
}

export async function generateRecruitClass(season: number, prisma?: PrismaClient): Promise<any[]> {
  const hsCount = Math.round(clampedNormal(500, 25, 450, 550));
  const jucoCount = Math.round(clampedNormal(125, 14, 100, 150));
  const intlCount = Math.round(clampedNormal(30, 5, 20, 40));
  const recruits: any[] = [];

  for (let i = 0; i < hsCount; i += 1) recruits.push(makeRecruit(i, 'HS', season));
  for (let i = 0; i < jucoCount; i += 1) recruits.push(makeRecruit(hsCount + i, 'JUCO', season));
  for (let i = 0; i < intlCount; i += 1) recruits.push(makeRecruit(hsCount + jucoCount + i, 'INTERNATIONAL', season));

  if (prisma) {
    await prisma.recruit.createMany({ data: recruits });
  }
  return recruits;
}
