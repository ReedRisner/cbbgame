export type SchemeAdjustments = { paceDelta: number; threePointDelta: number; postUsageDelta: number; zoneSwitch: boolean; pressDelta: number; defAggDelta: number };

export function evaluateAdjustments(gameState: { margin: number; oppThreePct: number; ownThreePct: number; foulTrouble: boolean }, coachEffects: { adaptabilityPossessions: number }): SchemeAdjustments {
  if (coachEffects.adaptabilityPossessions > 24) return { paceDelta: 0, threePointDelta: 0, postUsageDelta: 0, zoneSwitch: false, pressDelta: 0, defAggDelta: 0 };
  return {
    paceDelta: gameState.margin <= -10 ? 15 : gameState.margin >= 10 ? -10 : 0,
    threePointDelta: gameState.ownThreePct < 0.25 ? -15 : 0,
    postUsageDelta: gameState.ownThreePct < 0.25 ? 10 : 0,
    zoneSwitch: gameState.oppThreePct > 0.4,
    pressDelta: gameState.margin <= -10 ? 15 : 0,
    defAggDelta: gameState.foulTrouble ? -10 : 0,
  };
}
