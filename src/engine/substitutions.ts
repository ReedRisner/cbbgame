import type { PlayerGameState } from './types';

export type SubstitutionDecision = { outPlayerId: number; inPlayerId: number };

export function evaluateSubstitutions(gameState: { onCourt: PlayerGameState[]; bench: PlayerGameState[]; isSecondHalf: boolean; closeLateGame: boolean }, coachEffects: { gameManagementModifier: number }): SubstitutionDecision[] {
  const threshold = 70 + (coachEffects.gameManagementModifier * 10);
  const decisions: SubstitutionDecision[] = [];
  const sortedBench = [...gameState.bench].sort((a, b) => b.overall - a.overall);
  for (const player of gameState.onCourt) {
    const foulTrouble = (player as PlayerGameState & { fouls?: number }).fouls ?? 0;
    if ((player.fatigue > threshold || (!gameState.isSecondHalf && foulTrouble >= 3) || (gameState.isSecondHalf && foulTrouble >= 4)) && sortedBench.length > 0) {
      const sub = sortedBench.shift();
      if (sub) decisions.push({ outPlayerId: player.playerId, inPlayerId: sub.playerId });
    }
  }

  if (gameState.closeLateGame) {
    return [];
  }
  return decisions;
}
