export type CoachEffects = {
  offensiveModifier: number;
  defensiveModifier: number;
  developmentMultiplier: number;
  disciplineIncidentModifier: number;
  gameManagementModifier: number;
  adaptabilityPossessions: number;
  loyaltyModifier: number;
  ambitionModifier: number;
  ethicsModifier: number;
  recruitingModifier: number;
  charismaModifier: number;
};

export type PlayerGameState = {
  playerId: number;
  teamId: number;
  overall: number;
  fatigue: number;
  minutesPlayed: number;
  clutch: number;
  stamina: number;
  ballHandling: number;
  perimeterDefense: number;
  interiorDefense: number;
  threePoint: number;
  midRange: number;
  closeShot: number;
  freeThrow: number;
  competitiveness: number;
  injuryProneness: number;
  fitScore: number;
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

export type GameContext = {
  season: number;
  week: number;
  isConference: boolean;
  isTournament: boolean;
  isNCAATournament: boolean;
  neutralSite: boolean;
  storePossessions?: boolean;
  homeLineup: PlayerGameState[];
  awayLineup: PlayerGameState[];
  homeScheme: SchemeParams;
  awayScheme: SchemeParams;
  homeCoachEffects: CoachEffects;
  awayCoachEffects: CoachEffects;
};
