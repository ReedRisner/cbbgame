import { ClassYear, Position, Team } from '@prisma/client';
import { calculatePlayerOverall } from '../formulas/player';
import { generateName } from '../utils/names';
import { clampedNormal, weightedChoice } from '../utils/random';

const positionWeights: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const positionProb = [20, 24, 22, 19, 15];
const classOptions: ClassYear[] = ['FR', 'SO', 'JR', 'SR', 'GR'];
const classProb = [28, 24, 22, 19, 7];

export function generatePlayersForTeams(teams: Team[]): any[] {
  const players: any[] = [];
  let idx = 0;

  for (const team of teams) {
    const rosterSize = Math.round(clampedNormal(12.5, 1.2, 10, 15));
    const prestigeAdj = (team.currentPrestige - 50) / 2.5;
    for (let i = 0; i < rosterSize; i += 1) {
      const { firstName, lastName } = generateName(idx++);
      const position = weightedChoice(positionWeights, positionProb);
      const classYear = weightedChoice(classOptions, classProb);
      const age = classYear === 'FR' ? 18 : classYear === 'SO' ? 19 : classYear === 'JR' ? 20 : classYear === 'SR' ? 21 : 22;
      const devCurve = weightedChoice(['EARLY_BLOOMER', 'STANDARD', 'LATE_BLOOMER', 'BUST', 'FREAK_LEAP'], [15, 45, 20, 12, 8]);
      const base = clampedNormal(61 + prestigeAdj, 9, 35, 96);

      const attrs = {
        speed: clampedNormal(position === 'C' ? base - 8 : base + 5, 8, 25, 99),
        acceleration: clampedNormal(position === 'C' ? base - 9 : base + 4, 8, 25, 99),
        strength: clampedNormal(position === 'C' || position === 'PF' ? base + 9 : base - 3, 9, 25, 99),
        vertical: clampedNormal(base + 2, 10, 25, 99),
        stamina: clampedNormal(base + 1, 9, 25, 99),
        durability: clampedNormal(base, 8, 25, 99),
        insideScoring: clampedNormal(position === 'C' || position === 'PF' ? base + 6 : base - 2, 10, 25, 99),
        midRange: clampedNormal(position === 'SG' || position === 'SF' ? base + 4 : base - 1, 10, 25, 99),
        threePoint: clampedNormal(position === 'PG' || position === 'SG' ? base + 7 : base - 8, 11, 20, 99),
        freeThrow: clampedNormal(base + 3, 10, 25, 99),
        layup: clampedNormal(base + 3, 9, 25, 99),
        postMoves: clampedNormal(position === 'C' || position === 'PF' ? base + 8 : base - 7, 11, 20, 99),
        ballHandling: clampedNormal(position === 'PG' ? base + 10 : position === 'SG' ? base + 5 : base - 6, 11, 20, 99),
        passing: clampedNormal(position === 'PG' ? base + 9 : base - 3, 10, 20, 99),
        courtVision: clampedNormal(position === 'PG' ? base + 9 : base - 2, 10, 20, 99),
        perimeterDefense: clampedNormal(position === 'C' ? base - 6 : base + 2, 10, 20, 99),
        interiorDefense: clampedNormal(position === 'C' || position === 'PF' ? base + 8 : base - 8, 12, 20, 99),
        steal: clampedNormal(position === 'PG' || position === 'SG' ? base + 2 : base - 4, 10, 20, 99),
        block: clampedNormal(position === 'C' ? base + 10 : position === 'PF' ? base + 5 : base - 10, 11, 20, 99),
        rebounding: clampedNormal(position === 'C' ? base + 10 : position === 'PF' ? base + 7 : base - 7, 11, 20, 99),
        offensiveIQ: clampedNormal(base + 2, 8, 20, 99),
        defensiveIQ: clampedNormal(base + 2, 8, 20, 99),
        shotCreation: clampedNormal(position === 'PG' || position === 'SG' ? base + 4 : base - 3, 10, 20, 99),
        pickAndRoll: clampedNormal(base + 1, 10, 20, 99)
      };

      const overall = calculatePlayerOverall(position, attrs);
      const potential = clampedNormal(
        overall + (devCurve === 'FREAK_LEAP' ? 18 : devCurve === 'EARLY_BLOOMER' ? 12 : devCurve === 'STANDARD' ? 8 : devCurve === 'LATE_BLOOMER' ? 10 : 3),
        7,
        overall,
        99
      );

      players.push({
        teamId: team.id,
        firstName,
        lastName,
        hometown: 'Unknown',
        state: 'N/A',
        country: 'USA',
        position,
        classYear,
        age,
        heightInches: Math.round(clampedNormal(position === 'PG' ? 74 : position === 'SG' ? 77 : position === 'SF' ? 79 : position === 'PF' ? 81 : 83, 2.5, 69, 89)),
        weight: Math.round(clampedNormal(position === 'PG' ? 185 : position === 'SG' ? 200 : position === 'SF' ? 215 : position === 'PF' ? 235 : 250, 15, 155, 310)),
        ...attrs,
        shotTendency: clampedNormal(52, 16, 5, 99),
        driveTendency: clampedNormal(50, 16, 5, 99),
        passTendency: clampedNormal(52, 16, 5, 99),
        postTendency: clampedNormal(position === 'C' || position === 'PF' ? 65 : 35, 16, 5, 99),
        transitionTendency: clampedNormal(50, 15, 5, 99),
        foulTendency: clampedNormal(44, 14, 5, 99),
        hustleTendency: clampedNormal(60, 15, 5, 99),
        riskTendency: clampedNormal(45, 15, 5, 99),
        workEthic: clampedNormal(58, 15, 5, 99),
        leadership: clampedNormal(53, 16, 5, 99),
        coachability: clampedNormal(60, 14, 5, 99),
        discipline: clampedNormal(57, 16, 5, 99),
        loyalty: clampedNormal(55, 18, 5, 99),
        competitiveness: clampedNormal(63, 14, 5, 99),
        composure: clampedNormal(56, 14, 5, 99),
        injuryProneness: clampedNormal(45, 15, 1, 99),
        consistency: clampedNormal(57, 14, 10, 99),
        clutch: clampedNormal(53, 15, 5, 99),
        growthVariance: clampedNormal(50, 12, 10, 99),
        nbaPotential: clampedNormal((potential + overall) / 2, 12, 20, 99),
        academicDiscipline: clampedNormal(63, 14, 10, 99),
        trueOverall: overall,
        truePotential: potential,
        developmentCurve: devCurve,
        yearsRemaining: classYear === 'FR' ? 4 : classYear === 'SO' ? 3 : classYear === 'JR' ? 2 : classYear === 'SR' ? 1 : 1,
        isRedshirt: false
      });
    }
  }

  return players;
}
