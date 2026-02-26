export type HotSeatParams = {
  expectedWins: number;
  actualWins: number;
  tourneyDisappointment: number;
  scandalPenalty: number;
  fanPressure: number;
  consecutiveUnderperformYears?: number;
};

export function calculateHotSeatScore(params: HotSeatParams): number {
  const underYears = params.consecutiveUnderperformYears ?? 0;
  return ((params.expectedWins - params.actualWins) * 2)
    + (params.tourneyDisappointment * 3)
    + params.scandalPenalty
    + params.fanPressure
    + (underYears * 2);
}

export function calculateFiringProbability(hotSeat: number, threshold: number): number {
  return 1 / (1 + Math.exp(-((hotSeat - threshold) / 3)));
}

export type HireCandidate = {
  winRecord: number;
  recruitingSkill: number;
  charisma: number;
  schemeFit: number;
  loyalty: number;
  prestigeMatch: number;
  cost: number;
};

export type HireJobParams = {
  prestige: number;
};

export function calculateHireScore(candidate: HireCandidate, jobParams: HireJobParams): number {
  let w = {
    winRecord: 0.25,
    recruitingSkill: 0.2,
    charisma: 0.15,
    schemeFit: 0.15,
    loyalty: 0.1,
    prestigeMatch: 0.1,
    cost: 0.05,
  };

  if (jobParams.prestige >= 80) {
    w = { ...w, winRecord: w.winRecord * 1.3, charisma: w.charisma * 1.2, cost: w.cost * 0.5 };
  } else if (jobParams.prestige >= 35 && jobParams.prestige <= 60) {
    w = { ...w, recruitingSkill: w.recruitingSkill * 1.3, cost: w.cost * 1.5 };
  } else if (jobParams.prestige < 35) {
    w = { ...w, recruitingSkill: w.recruitingSkill * 1.2, cost: w.cost * 2 };
  }

  return (candidate.winRecord * w.winRecord)
    + (candidate.recruitingSkill * w.recruitingSkill)
    + (candidate.charisma * w.charisma)
    + (candidate.schemeFit * w.schemeFit)
    + (candidate.loyalty * w.loyalty)
    + (candidate.prestigeMatch * w.prestigeMatch)
    + (candidate.cost * w.cost);
}

export function calculateBuyout(salary: number, yearsRemaining: number): number {
  return salary * yearsRemaining * 0.7;
}

export function calculateCoachDevRate(experience: number, winPct: number, tourneySuccess: number, mentorQuality: number): number {
  return (experience * 0.3) + (winPct * 0.3) + (tourneySuccess * 0.2) + (mentorQuality * 0.2);
}

export function calculateAssistantBonus(assistantSkill: number, role: 'OC' | 'DC' | 'RC' | 'PDC'): number {
  if (role === 'OC' || role === 'DC' || role === 'PDC') {
    return Math.min(8, assistantSkill / 12.5);
  }
  return Math.min(10, assistantSkill / 10);
}
