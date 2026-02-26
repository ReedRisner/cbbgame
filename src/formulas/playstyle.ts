export type SchemeSliders = {
  pace: number;
  threePointEmphasis: number;
  postUsage: number;
  pressFrequency: number;
  zoneVsMan: number;
  pickAndRoll: number;
  transitionPush: number;
  defensiveAggression: number;
};

export type SchemeParams = {
  possessionsPerGame: number;
  threePointAttemptRate: number;
  postPossessionRate: number;
  pressRate: number;
  zoneRate: number;
  pnrPossessionRate: number;
  fastBreakRate: number;
  defAggRate: number;
};

export function schemeToSimParams(s: SchemeSliders): SchemeParams {
  return {
    possessionsPerGame: 60 + (s.pace / 100) * 18,
    threePointAttemptRate: 0.2 + (s.threePointEmphasis / 100) * 0.3,
    postPossessionRate: 0.05 + (s.postUsage / 100) * 0.3,
    pressRate: s.pressFrequency / 100,
    zoneRate: s.zoneVsMan / 100,
    pnrPossessionRate: 0.1 + (s.pickAndRoll / 100) * 0.35,
    fastBreakRate: 0.1 + (s.transitionPush / 100) * 0.2,
    defAggRate: s.defensiveAggression / 100,
  };
}

export function calculateFitScore(playerTendencies: number[], schemeRequirements: number[]): number {
  const n = Math.min(playerTendencies.length, schemeRequirements.length);
  if (n === 0) return 50;
  let mismatch = 0;
  for (let i = 0; i < n; i += 1) {
    mismatch += Math.abs(playerTendencies[i] - schemeRequirements[i]);
  }
  return Math.max(0, Math.min(100, 100 - (mismatch / n)));
}

export function calculateMoraleDelta(fitScore: number, ptSatisfaction: number, nilJealousy: number, winLoss: number, leadershipBuffer: number): number {
  const fitMorale = fitScore < 50 ? -2 : fitScore > 80 ? 1 : 0;
  const ptMorale = ptSatisfaction;
  const nilMorale = nilJealousy * -2;
  return fitMorale + ptMorale + nilMorale + winLoss + leadershipBuffer;
}
