import { prisma } from '../../api/routes/_db';
import { clampedNormal } from '../../utils/random';

export async function runAssistantPoaching(season: number): Promise<number> {
  const assistants = await prisma.coach.findMany({ where: { role: { not: 'HEAD' } }, include: { team: true } });
  let poached = 0;
  for (const assistant of assistants) {
    const avg = (assistant.offense + assistant.defense + assistant.recruiting + assistant.development) / 4;
    const teamSuccess = Math.max(0.1, assistant.team.currentPrestige / 100);
    const ambition = assistant.programBuilding;
    const probability = (avg / 100) * (teamSuccess * 0.3) * (ambition / 100) * 0.15;
    if (Math.random() < probability) {
      poached += 1;
      await prisma.coach.update({ where: { id: assistant.id }, data: { role: 'HEAD' } });
      await prisma.coach.create({
        data: {
          teamId: assistant.teamId,
          role: assistant.role,
          firstName: `Replacement${assistant.id}`,
          lastName: 'Coach',
          age: 42,
          overall: clampedNormal(avg - 10, 8, 30, 75),
          offense: clampedNormal(assistant.offense - 10, 8, 30, 75),
          defense: clampedNormal(assistant.defense - 10, 8, 30, 75),
          recruiting: clampedNormal(assistant.recruiting - 10, 8, 30, 75),
          development: clampedNormal(assistant.development - 10, 8, 30, 75),
          discipline: assistant.discipline,
          adaptability: assistant.adaptability,
          analytics: assistant.analytics,
          charisma: assistant.charisma,
          programBuilding: assistant.programBuilding,
          gameManagement: assistant.gameManagement,
          integrity: assistant.integrity,
          pace: assistant.pace,
          spacing: assistant.spacing,
          pressureDefense: assistant.pressureDefense,
          crashBoards: assistant.crashBoards,
          transitionFocus: assistant.transitionFocus,
          pickAndRollUsage: assistant.pickAndRollUsage,
          zoneRate: assistant.zoneRate,
          benchDepthTrust: assistant.benchDepthTrust,
          contractYears: 2,
          salary: assistant.salary * 0.7,
          buyout: 0,
          careerWins: 0,
          careerLosses: 0,
          careerTournamentWins: 0,
          hiringSeason: season,
        },
      });
    }
  }
  return poached;
}
