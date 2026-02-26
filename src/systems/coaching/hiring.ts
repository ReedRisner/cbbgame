import { prisma } from '../../api/routes/_db';
import { calculateHireScore } from '../../formulas/coaching';
import { clampedNormal } from '../../utils/random';

export async function runCoachHiring(teamId: number, season: number): Promise<{ hiredCoachId: number | null }> {
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
  const fired = await prisma.coach.findMany({ where: { role: 'HEAD', buyoutStatus: true } });
  const assistants = await prisma.coach.findMany({ where: { role: { not: 'HEAD' }, programBuilding: { gt: 50 } } });
  const pool = [...fired, ...assistants];

  for (let i = 0; i < 5; i += 1) {
    pool.push(await prisma.coach.create({ data: {
      teamId,
      role: 'OC',
      firstName: `External${season}${i}`,
      lastName: 'Candidate',
      age: 39,
      overall: clampedNormal(team.currentPrestige, 10, 35, 95),
      offense: clampedNormal(team.currentPrestige, 10, 35, 95),
      defense: clampedNormal(team.currentPrestige, 10, 35, 95),
      recruiting: clampedNormal(team.currentPrestige, 10, 35, 95),
      development: clampedNormal(team.currentPrestige, 10, 35, 95),
      discipline: 60, adaptability: 60, analytics: 60, charisma: 60, programBuilding: 60, gameManagement: 60, integrity: 60,
      pace: 50, spacing: 50, pressureDefense: 50, crashBoards: 50, transitionFocus: 50, pickAndRollUsage: 50, zoneRate: 50, benchDepthTrust: 50,
      contractYears: 3, salary: 1_000_000, buyout: 0, careerWins: 0, careerLosses: 0, careerTournamentWins: 0, hiringSeason: season,
    } }));
  }

  let best: { id: number; score: number } | null = null;
  for (const candidate of pool) {
    const score = calculateHireScore({
      winRecord: candidate.careerWins + candidate.careerLosses > 0 ? (candidate.careerWins / (candidate.careerWins + candidate.careerLosses)) * 100 : 50,
      recruitingSkill: candidate.recruiting,
      charisma: candidate.charisma,
      schemeFit: candidate.offense,
      loyalty: candidate.programBuilding,
      prestigeMatch: 100 - Math.abs(team.currentPrestige - candidate.overall),
      cost: Math.max(0, 100 - (candidate.salary / 100_000)),
    }, { prestige: team.currentPrestige });

    if (!best || score > best.score) best = { id: candidate.id, score };
  }

  if (!best) return { hiredCoachId: null };
  await prisma.coach.update({ where: { id: best.id }, data: { role: 'HEAD', teamId, buyoutStatus: false } });
  await prisma.coachJobOffer.create({ data: { coachId: best.id, teamId, season, hireScore: best.score, status: 'ACCEPTED', salaryOffered: 1_500_000, yearsOffered: 4 } });
  return { hiredCoachId: best.id };
}

export async function runAllHiring(season: number): Promise<{ hired: number }> {
  const vacancies = await prisma.coach.findMany({ where: { role: 'HEAD', buyoutStatus: true } });
  let hired = 0;
  for (const v of vacancies) {
    const result = await runCoachHiring(v.teamId, season);
    if (result.hiredCoachId) hired += 1;
  }
  return { hired };
}
