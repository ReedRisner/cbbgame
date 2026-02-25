export function calculateConferencePrestige(input: {
  avgTeamPrestige: number;
  top5AvgPrestige: number;
  tourneySuccess: number;
  mediaDealValue: number;
  historicalWeight: number;
}): number {
  const value =
    input.avgTeamPrestige * 0.3 +
    input.top5AvgPrestige * 0.25 +
    input.tourneySuccess * 0.2 +
    input.mediaDealValue * 0.15 +
    input.historicalWeight * 0.1;
  return Math.max(1, Math.min(100, value));
}

export function classifyBlueBlood(input: {
  historicalPrestige: number;
  currentPrestige: number;
  finalFourCount: number;
}): 'BLUE_BLOOD' | 'NEW_BLOOD' | 'TRADITIONAL' | 'NONE' {
  const { historicalPrestige, currentPrestige, finalFourCount } = input;
  if (historicalPrestige >= 92 && currentPrestige >= 85 && finalFourCount >= 6) return 'BLUE_BLOOD';
  if (historicalPrestige >= 82 && currentPrestige >= 80 && finalFourCount >= 3) return 'NEW_BLOOD';
  if (historicalPrestige >= 75 || finalFourCount >= 2) return 'TRADITIONAL';
  return 'NONE';
}

export function calculatePrestigeGrowth(input: {
  winImpact: number;
  tourneyImpact: number;
  recruitingRankImpact: number;
  nbaDraftPicksImpact: number;
  mediaBuzz: number;
  facilityBonus: number;
  sanctionsPenalty: number;
}): number {
  return (
    input.winImpact * 0.3 +
    input.tourneyImpact * 0.25 +
    input.recruitingRankImpact * 0.15 +
    input.nbaDraftPicksImpact * 0.1 +
    input.mediaBuzz * 0.1 +
    input.facilityBonus * 0.1 -
    input.sanctionsPenalty * 0.2
  );
}

export function calculatePrestigeDecay(input: {
  baseDecay: number;
  underperformanceYears: number;
  historicalPrestige: number;
  rolling10YearAverage: number;
}): number {
  const underperfScale = 1 + input.underperformanceYears * 0.12;
  const regression = (input.historicalPrestige - input.rolling10YearAverage) * 0.08;
  return input.baseDecay * underperfScale + regression;
}
