import { Team } from '@prisma/client';
import { generateName } from '../utils/names';
import { clampedNormal } from '../utils/random';

const assistantRoles = ['OC', 'DC', 'RECRUITING_COORDINATOR', 'PLAYER_DEVELOPMENT'] as const;

export function generateCoachesForTeams(teams: Team[]): { heads: any[]; assistants: any[] } {
  const heads: any[] = [];
  const assistants: any[] = [];
  let idx = 7000;

  teams.forEach((team, teamIndex) => {
    const { firstName, lastName } = generateName(idx++);
    const base = 48 + team.currentPrestige * 0.42;

    heads.push({
      teamId: team.id,
      role: 'HEAD',
      firstName,
      lastName,
      age: Math.round(clampedNormal(49, 8, 32, 74)),
      overall: clampedNormal(base, 8, 30, 99),
      offense: clampedNormal(base, 10, 25, 99),
      defense: clampedNormal(base, 10, 25, 99),
      recruiting: clampedNormal(base + 1, 10, 25, 99),
      development: clampedNormal(base + 2, 8, 25, 99),
      discipline: clampedNormal(base, 9, 25, 99),
      adaptability: clampedNormal(base, 8, 25, 99),
      analytics: clampedNormal(base, 11, 25, 99),
      charisma: clampedNormal(base, 10, 25, 99),
      programBuilding: clampedNormal(base + 1, 9, 25, 99),
      gameManagement: clampedNormal(base, 9, 25, 99),
      integrity: clampedNormal(70, 12, 20, 99),
      pace: clampedNormal(50, 20, 1, 99),
      spacing: clampedNormal(50, 20, 1, 99),
      pressureDefense: clampedNormal(50, 20, 1, 99),
      crashBoards: clampedNormal(50, 20, 1, 99),
      transitionFocus: clampedNormal(50, 20, 1, 99),
      pickAndRollUsage: clampedNormal(50, 20, 1, 99),
      zoneRate: clampedNormal(45, 22, 1, 99),
      benchDepthTrust: clampedNormal(55, 15, 1, 99),
      contractYears: Math.round(clampedNormal(5, 1.5, 2, 8)),
      salary: Math.round(clampedNormal(team.currentPrestige > 75 ? 4_000_000 : team.currentPrestige > 60 ? 2_200_000 : 900_000, 350_000, 300_000, 8_000_000)),
      buyout: Math.round(clampedNormal(2_000_000, 700_000, 200_000, 12_000_000)),
      careerWins: Math.round(clampedNormal(250, 120, 0, 950)),
      careerLosses: Math.round(clampedNormal(160, 80, 0, 700)),
      careerTournamentWins: Math.round(clampedNormal(team.currentPrestige / 2, 8, 0, 90)),
      hiringSeason: 1,
      // Assigned later by a dedicated coaching-tree pipeline to avoid FK issues across reseeds.
      parentCoachId: null
    });
  });

  teams.forEach((team) => {
    const base = 43 + team.currentPrestige * 0.36;
    assistantRoles.forEach((role) => {
      const { firstName, lastName } = generateName(idx++);
      assistants.push({
        teamId: team.id,
        role,
        firstName,
        lastName,
        age: Math.round(clampedNormal(39, 8, 24, 68)),
        overall: clampedNormal(base, 10, 25, 95),
        offense: clampedNormal(base, 11, 25, 95),
        defense: clampedNormal(base, 11, 25, 95),
        recruiting: clampedNormal(base + (role === 'RECRUITING_COORDINATOR' ? 8 : 0), 11, 25, 99),
        development: clampedNormal(base + (role === 'PLAYER_DEVELOPMENT' ? 8 : 0), 10, 25, 99),
        discipline: clampedNormal(base, 11, 25, 95),
        adaptability: clampedNormal(base, 11, 25, 95),
        analytics: clampedNormal(base, 12, 25, 95),
        charisma: clampedNormal(base, 10, 25, 95),
        programBuilding: clampedNormal(base, 10, 25, 95),
        gameManagement: clampedNormal(base, 10, 25, 95),
        integrity: clampedNormal(70, 12, 20, 99),
        pace: clampedNormal(50, 20, 1, 99),
        spacing: clampedNormal(50, 20, 1, 99),
        pressureDefense: clampedNormal(50, 20, 1, 99),
        crashBoards: clampedNormal(50, 20, 1, 99),
        transitionFocus: clampedNormal(50, 20, 1, 99),
        pickAndRollUsage: clampedNormal(50, 20, 1, 99),
        zoneRate: clampedNormal(45, 22, 1, 99),
        benchDepthTrust: clampedNormal(55, 15, 1, 99),
        contractYears: Math.round(clampedNormal(3, 1, 1, 5)),
        salary: Math.round(clampedNormal(300_000, 90_000, 75_000, 1_200_000)),
        buyout: Math.round(clampedNormal(120_000, 80_000, 10_000, 1_000_000)),
        careerWins: Math.round(clampedNormal(70, 40, 0, 400)),
        careerLosses: Math.round(clampedNormal(55, 35, 0, 350)),
        careerTournamentWins: Math.round(clampedNormal(4, 4, 0, 30)),
        hiringSeason: 1,
        parentCoachId: null
      });
    });
  });

  return { heads, assistants };
}
