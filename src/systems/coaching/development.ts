import { prisma } from '../../api/routes/_db';
import { calculateCoachDevRate } from '../../formulas/coaching';

export async function developCoach(coachId: number, season: number): Promise<{ coachId: number; delta: number }> {
  const coach = await prisma.coach.findUniqueOrThrow({ where: { id: coachId } });
  const exp = Math.min(1, Math.max(0, (season - coach.hiringSeason) / 10));
  const games = coach.careerWins + coach.careerLosses;
  const winPct = games > 0 ? coach.careerWins / games : 0.5;
  const tourneySuccess = Math.min(1, coach.careerTournamentWins * 0.05);
  const mentor = coach.parentCoachId ? await prisma.coach.findUnique({ where: { id: coach.parentCoachId } }) : null;
  const mentorQuality = mentor ? Math.min(1, mentor.overall / 100) : 0.5;
  const rate = calculateCoachDevRate(exp, winPct, tourneySuccess, mentorQuality);

  const delta = coach.age < 40 ? (rate > 0.6 ? 2 : 1) : coach.age < 55 ? (rate > 0.7 ? 1 : 0) : -0.5;
  await prisma.coach.update({ where: { id: coachId }, data: { recruiting: Math.max(30, Math.min(99, coach.recruiting + delta)), charisma: Math.max(30, Math.min(99, coach.charisma + delta)) } });
  return { coachId, delta };
}

export async function runAllCoachDevelopment(season: number): Promise<void> {
  const coaches = await prisma.coach.findMany();
  for (const coach of coaches) {
    await developCoach(coach.id, season);
  }
}
