import { generateRefCrew } from './referee';
import type { GameContext } from './types';

export function setupGame(homeTeamId: number, awayTeamId: number, context: GameContext) {
  return {
    homeTeamId,
    awayTeamId,
    homeLineup: context.homeLineup,
    awayLineup: context.awayLineup,
    refProfile: generateRefCrew(),
    timeRemaining: 40 * 60,
  };
}
