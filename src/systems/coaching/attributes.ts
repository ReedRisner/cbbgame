import { prisma } from '../../api/routes/_db';
import type { CoachEffects } from '../../engine/types';

export async function getCoachEffects(coachId: number): Promise<CoachEffects> {
  const coach = await prisma.coach.findUniqueOrThrow({ where: { id: coachId } });
  return {
    offensiveModifier: (coach.offense - 50) * 0.15,
    defensiveModifier: (coach.defense - 50) * 0.15,
    developmentMultiplier: 0.6 + (coach.development / 100) * 0.6,
    disciplineIncidentModifier: 1 - ((coach.discipline - 50) / 200),
    gameManagementModifier: (coach.gameManagement - 50) / 100,
    adaptabilityPossessions: Math.max(1, 12 - (coach.adaptability / 10)),
    loyaltyModifier: coach.programBuilding / 100,
    ambitionModifier: coach.programBuilding / 100,
    ethicsModifier: coach.integrity / 100,
    recruitingModifier: (coach.recruiting - 50) * 0.1,
    charismaModifier: (coach.charisma - 50) * 0.08,
  };
}
