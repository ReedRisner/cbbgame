import { prisma } from '../../api/routes/_db';
import { calculateAssistantBonus } from '../../formulas/coaching';

export async function getEffectiveCoachingRatings(teamId: number): Promise<{ offIQ: number; defIQ: number; devSkill: number; recruitSkill: number }> {
  const coaches = await prisma.coach.findMany({ where: { teamId } });
  const head = coaches.find((c) => c.role === 'HEAD');
  if (!head) throw new Error('Missing head coach');

  const oc = coaches.find((c) => c.role === 'OC');
  const dc = coaches.find((c) => c.role === 'DC');
  const rc = coaches.find((c) => c.role === 'RECRUITING_COORDINATOR');
  const pdc = coaches.find((c) => c.role === 'PLAYER_DEVELOPMENT');

  return {
    offIQ: head.offense + (oc ? calculateAssistantBonus(oc.offense, 'OC') : 0),
    defIQ: head.defense + (dc ? calculateAssistantBonus(dc.defense, 'DC') : 0),
    devSkill: head.development + (pdc ? calculateAssistantBonus(pdc.development, 'PDC') : 0),
    recruitSkill: head.recruiting + (rc ? calculateAssistantBonus(rc.recruiting, 'RC') : 0),
  };
}
