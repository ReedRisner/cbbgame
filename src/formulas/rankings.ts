export type Quad = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export function calculateSOS(avgOppRating: number, avgOppWinPct: number, avgOppSOS: number): number {
  return (0.60 * avgOppRating) + (0.25 * avgOppWinPct) + (0.15 * avgOppSOS);
}

export function calculateAPVoterScore(winPct: number, adjEff: number, sos: number, bestWins: number, eyeTest: number, voterBias: number): number {
  return (0.30 * winPct) + (0.25 * adjEff) + (0.20 * sos) + (0.15 * bestWins) + (0.10 * eyeTest) + voterBias;
}

export function calculateCoachesPollScore(apScore: number, ownConfBias: number, ballotFatigue: number): number {
  return (apScore * 0.7) + ownConfBias + ballotFatigue;
}

export function calculateNET(teamValue: number, netEff: number, quadWinPct: number, adjWinPct: number, scoringMargin: number): number {
  return (0.25 * teamValue) + (0.25 * netEff) + (0.20 * quadWinPct) + (0.15 * adjWinPct) + (0.15 * scoringMargin);
}

export function calculateAdjOffEff(rawOff: number, natAvgDef: number, oppAdjDef: number): number {
  return rawOff * (natAvgDef / Math.max(1, oppAdjDef));
}

export function calculateAdjDefEff(rawDef: number, natAvgOff: number, oppAdjOff: number): number {
  return rawDef * (natAvgOff / Math.max(1, oppAdjOff));
}

export function calculateResumeScore(q1Wins: number, net: number, sos: number, q1q2Record: number, confRecord: number, last10: number, bonusPoints: number): number {
  return (0.25 * q1Wins) + (0.20 * net) + (0.15 * sos) + (0.15 * q1q2Record) + (0.10 * confRecord) + (0.10 * last10) + (0.05 * bonusPoints);
}

export function classifyQuad(oppNET: number, location: 'HOME' | 'NEUTRAL' | 'AWAY'): Quad {
  if (location === 'HOME') {
    if (oppNET <= 30) return 'Q1';
    if (oppNET <= 75) return 'Q2';
    if (oppNET <= 160) return 'Q3';
    return 'Q4';
  }
  if (location === 'NEUTRAL') {
    if (oppNET <= 50) return 'Q1';
    if (oppNET <= 100) return 'Q2';
    if (oppNET <= 200) return 'Q3';
    return 'Q4';
  }
  if (oppNET <= 75) return 'Q1';
  if (oppNET <= 135) return 'Q2';
  if (oppNET <= 240) return 'Q3';
  return 'Q4';
}
