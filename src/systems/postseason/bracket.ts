import { prisma } from '../../api/routes/_db';
import type { SelectionResult } from './selection';

export type NCAATournamentBracket = { season: number; teamCount: number };

export async function buildNCAATournamentBracket(selectionResult: SelectionResult, season: number): Promise<NCAATournamentBracket> {
  const regions = ['SOUTH', 'EAST', 'MIDWEST', 'WEST'] as const;
  await prisma.ncaaTournament.deleteMany({ where: { season } });
  for (let i = 0; i < Math.min(68, selectionResult.field.length); i += 1) {
    await prisma.ncaaTournament.create({
      data: {
        season,
        teamId: selectionResult.field[i],
        seed: Math.floor(i / 4) + 1,
        region: regions[i % 4],
        bracketPosition: `P${i + 1}`,
      },
    });
  }
  return { season, teamCount: Math.min(68, selectionResult.field.length) };
}
