import { prisma } from '../../api/routes/_db';
import { schemeToSimParams } from '../../formulas/playstyle';
import type { SchemeParams } from '../../engine/types';

export async function getSchemeParameters(coachId: number): Promise<SchemeParams> {
  const coach = await prisma.coach.findUniqueOrThrow({ where: { id: coachId } });
  return schemeToSimParams({
    pace: coach.pace,
    threePointEmphasis: coach.spacing,
    postUsage: 100 - coach.spacing,
    pressFrequency: coach.pressureDefense,
    zoneVsMan: coach.zoneRate,
    pickAndRoll: coach.pickAndRollUsage,
    transitionPush: coach.transitionFocus,
    defensiveAggression: coach.pressureDefense,
  });
}
