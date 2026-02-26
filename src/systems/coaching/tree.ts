import { prisma } from '../../api/routes/_db';

export type CoachTreeNode = { id: number; parentCoachId: number | null; name: string };
export type TreeBonuses = { schemeSimilarity: number; regionInterestBonus: number; treeHireBonus: number };

export async function getCoachingTree(coachId: number): Promise<CoachTreeNode[]> {
  const root = await prisma.coach.findUniqueOrThrow({ where: { id: coachId } });
  const nodes = await prisma.coach.findMany({ where: { OR: [{ id: coachId }, { parentCoachId: root.parentCoachId ?? coachId }] } });
  return nodes.map((n) => ({ id: n.id, parentCoachId: n.parentCoachId, name: `${n.firstName} ${n.lastName}` }));
}

export function applyTreeEffects(coachId: number, context: { sameTree: boolean; mentorRegionMatch: boolean }): TreeBonuses {
  return {
    schemeSimilarity: context.sameTree ? 10 : 0,
    regionInterestBonus: context.mentorRegionMatch ? 5 : 0,
    treeHireBonus: context.sameTree ? 0.2 : 0,
  };
}
