import { describe, it, expect } from 'vitest';
import { facilityUpgradeCost, facilityDegradation, fanInterest, calculateBudgetRevenue } from '../../src/formulas/team';

describe('team formulas', () => {
  it('computes non linear cost and degradation', () => {
    expect(facilityUpgradeCost(1_000_000, 5)).toBeCloseTo(1_216_652.9, 0);
    expect(facilityDegradation(7)).toBe(2);
  });

  it('computes fan and revenue', () => {
    const fan = fanInterest({ prestige: 80, winPct: 0.72, fanBaseIntensity: 85, starPlayerPresence: 70, rivalryIntensity: 75 });
    expect(fan.homeCourtBonus).toBeGreaterThan(0);
    expect(calculateBudgetRevenue({ conferenceRevenueShare: 10, gameDayRevenue: 8, boosterDonations: 7, merchRevenue: 4, ncaaTournamentPayout: 3 })).toBe(32);
  });
});
