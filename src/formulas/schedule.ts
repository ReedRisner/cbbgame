export function calculateDesiredSOS(confPrestige: number, teamPrestige: number, coachAmbition: number): number {
  return (confPrestige * 0.4) + (teamPrestige * 0.3) + (coachAmbition * 0.3);
}

export function calculateRivalryIntensityDelta(
  competitiveBalance: number,
  sameConference: boolean,
  recentHistory: number,
): number {
  const conferenceMembership = sameConference ? 3 : -3;
  return (competitiveBalance * 0.4) + (conferenceMembership * 0.3) + (recentHistory * 0.3);
}
