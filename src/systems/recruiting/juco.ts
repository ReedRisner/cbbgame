import type { Recruit } from '@prisma/client';

export function isJUCO(recruit: Pick<Recruit, 'type'>): boolean {
  return recruit.type === 'JUCO';
}
