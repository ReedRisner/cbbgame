import { prisma } from '../../api/routes/_db';
import { getScoutedRange, scoutingUncertainty } from '../../formulas/recruiting';

export function calculateUncertainty(
  recruit: { position: string; country: string },
  teamInvestment: number,
): number {
  const positionFactor = ['PF', 'C'].includes(recruit.position)
    ? 1.4
    : ['SG', 'SF'].includes(recruit.position)
      ? 1.2
      : 1.0;
  const geographyFactor = recruit.country === 'USA' ? 1 : 1.5;
  return scoutingUncertainty({
    baseUncertainty: 15,
    scoutingInvestment: teamInvestment,
    positionFactor,
    geographyFactor,
  });
}

export { getScoutedRange };

export async function upsertScoutingInvestment(
  recruitId: number,
  teamId: number,
  season: number,
  investmentLevel: number,
): Promise<void> {
  const recruit = await prisma.recruit.findUniqueOrThrow({ where: { id: recruitId } });
  const uncertainty = calculateUncertainty(recruit, investmentLevel);
  await prisma.recruitScouting.upsert({
    where: { recruitId_teamId_season: { recruitId, teamId, season } },
    create: { recruitId, teamId, season, investmentLevel, currentUncertainty: uncertainty },
    update: { investmentLevel, currentUncertainty: uncertainty },
  });
}
