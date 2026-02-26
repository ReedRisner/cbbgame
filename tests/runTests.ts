import assert from 'node:assert/strict';
import { commitmentProbability, computePersonalityWeights, scoutingUncertainty } from '../src/formulas/recruiting';
import { TRANSFER_SITOUT_RULE, calculateTamperRisk, isImmediatelyEligibleByCount } from '../src/formulas/portal';
import { calculateAnnualNILBudgetFormula, calculateNILRecruitingImpact, enforceNILSoftCapFormula } from '../src/formulas/nil';

function runRecruitingTests() {
  const weights = computePersonalityWeights({ ego: 90, loyalty: 20, nbaDraftInterest: 80, maturity: 75, academicAffinity: 80 });
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-6, 'recruiting weights should normalize to 1');

  assert.equal(scoutingUncertainty({ baseUncertainty: 15, scoutingInvestment: 0, positionFactor: 1.4, geographyFactor: 1.5 }), 10);
  assert.equal(scoutingUncertainty({ baseUncertainty: 15, scoutingInvestment: 1, positionFactor: 1, geographyFactor: 1 }), 3);

  assert.ok(commitmentProbability(95, 70) > 0.8, 'dominant lead should produce high commitment probability');
}

function runPortalTests() {
  assert.equal(TRANSFER_SITOUT_RULE.firstTime, false);
  assert.equal(TRANSFER_SITOUT_RULE.secondTime, true);
  assert.equal(isImmediatelyEligibleByCount(0), true);
  assert.equal(isImmediatelyEligibleByCount(1), false);
  assert.equal(calculateTamperRisk({ coachEthics: 20, nilCollective: 90, playerValue: 90 }), 0.35);
}

function runNilTests() {
  const top = calculateAnnualNILBudgetFormula({ boosterBudget: 80, mediaMarket: 98, currentPrestige: 98, fanInterest: 98, donorMomentum: 0 });
  const bottom = calculateAnnualNILBudgetFormula({ boosterBudget: 2, mediaMarket: 10, currentPrestige: 10, fanInterest: 15, donorMomentum: 0 });
  assert.ok(top / bottom > 150, 'NIL budget spread should be very large');

  const cap = enforceNILSoftCapFormula(1_000_000, 300_000);
  assert.equal(cap.allowed, false);
  assert.equal(cap.maxAllowed, 250_000);

  const nearMedian = calculateNILRecruitingImpact(100_000, 100_000);
  const huge = calculateNILRecruitingImpact(1_000_000, 100_000);
  assert.ok(huge - nearMedian < 30, 'NIL impact should show diminishing returns');
}

runRecruitingTests();
runPortalTests();
runNilTests();
console.log('All Phase 2 formula tests passed.');
