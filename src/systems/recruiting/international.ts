import { prisma } from '../../api/routes/_db';
import type { Recruit } from '@prisma/client';

export function isInternational(recruit: Pick<Recruit, 'type'>): boolean {
  return recruit.type === 'INTERNATIONAL';
}

export async function rollVisaDelay(recruitId: number): Promise<{ delayed: boolean; weeks: number }> {
  const delayed = Math.random() < 0.05;
  const weeks = delayed ? Math.floor(Math.random() * 3) + 2 : 0;
  await prisma.recruit.update({ where: { id: recruitId }, data: { visaDelayRisk: delayed ? 1 : 0 } });
  return { delayed, weeks };
}

export function applyCulturalAdjustment(_playerId: number, weekOfSeason: number): number {
  if (weekOfSeason <= 0) return 0;
  const startPenalty = -5;
  const recoveryWindow = 20;
  const progress = Math.min(1, weekOfSeason / recoveryWindow);
  return startPenalty * (1 - progress);
}
