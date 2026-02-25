export function scoutingUncertainty(input: {
  baseUncertainty: number;
  scoutingInvestment: number;
  positionFactor: number;
  geographyFactor: number;
}): number {
  const floor = 1.5;
  const value = input.baseUncertainty * (1 - input.scoutingInvestment) * input.positionFactor * input.geographyFactor;
  return Math.max(floor, value);
}

export function recruitCompositeScore(input: {
  scoutedPotential: number;
  scoutedOverall: number;
  measurables: number;
  eventPerformance: number;
}): number {
  return (
    input.scoutedPotential * 0.4 +
    input.scoutedOverall * 0.35 +
    input.measurables * 0.15 +
    input.eventPerformance * 0.1
  );
}

export function starRatingFromComposite(composite: number): number {
  if (composite >= 91) return 5;
  if (composite >= 82) return 4;
  if (composite >= 72) return 3;
  if (composite >= 63) return 2;
  return 1;
}
