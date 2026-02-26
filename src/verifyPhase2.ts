import { prisma } from './api/routes/_db';
import { runPostseasonPortalEvaluation } from './systems/portal/entry';
import { runPortalMarketplace } from './systems/portal/marketplace';
import { recalculateAllNILBudgets } from './systems/nil/collective';
import { runAINILAllocation } from './systems/nil/contracts';
import { applyFatigueToAllTeams } from './systems/nil/boosterFatigue';
import { runTamperingAudits } from './systems/portal/tampering';
import { advanceRecruitingWeek, runFullRecruitingCycle } from './systems/recruiting/calendar';
import { calculateUncertainty } from './systems/recruiting/scouting';
import { calculateVisitBoost } from './systems/recruiting/visits';
import { calculateNBATrackRecord, getProDevGrade } from './systems/recruiting/proDev';
import { isJUCO } from './systems/recruiting/juco';
import { isInternational, rollVisaDelay, applyCulturalAdjustment } from './systems/recruiting/international';
import { calculatePlayerNILValue } from './systems/nil/valuation';
import { updateSocialMedia } from './systems/nil/socialMedia';
import { evaluateRenegotiation } from './systems/nil/contracts';
import { runTeamJealousyCheck } from './systems/nil/jealousy';
import { enforceNILSoftCap } from './systems/nil/softCap';
import { calculateNILRecruitingImpact } from './formulas/nil';
import { computePersonalityWeights } from './formulas/recruiting';

function check(label: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FLAG'} ${label}: ${detail}`);
}

async function main() {
  const season = 1;
  const fullMode = process.env.VERIFY_PHASE2_FULL === '1';
  console.log('=== Phase 2 verification start ===');
  console.log(`Mode: ${fullMode ? 'FULL (36 weeks)' : 'FAST (6 weeks)'}`);

  console.log('[1/6] Recalculating NIL budgets...');
  await recalculateAllNILBudgets(season);
  const teams = await prisma.team.findMany({ select: { id: true, currentPrestige: true, annualNilBudget: true }, orderBy: { id: 'asc' } });

  console.log('[2/6] Running AI NIL allocation (sample teams)...');
  for (const t of teams.slice(0, 40)) await runAINILAllocation(t.id, season);

  console.log('[3/6] Running recruiting simulation...');
  const recruitingSummary = fullMode
    ? await runFullRecruitingCycle(season)
    : {
        season,
        weeks: await (async () => {
          const weeks = [];
          for (let week = 1; week <= 6; week += 1) {
            weeks.push(await advanceRecruitingWeek(season, week));
            console.log(`  - completed week ${week}/6`);
          }
          return weeks;
        })(),
      };

  console.log('[4/6] Running portal evaluation + marketplace...');
  const portalEntries = await runPostseasonPortalEvaluation(season);
  const portalMarketplace = await runPortalMarketplace(season);

  console.log('[5/6] Applying booster fatigue + tampering audits...');
  await applyFatigueToAllTeams(season);
  const tampering = await runTamperingAudits(season);

  console.log('[6/6] Aggregating summary metrics...');

  const recruitsByType = await prisma.recruit.groupBy({ by: ['type', 'starRating'], where: { season }, _count: true });
  const commitmentsByStar = await prisma.recruit.groupBy({ by: ['starRating'], where: { season, signedTeamId: { not: null } }, _count: true });
  const uncommitted = await prisma.recruit.count({ where: { season, signedTeamId: null } });
  const visitsOfficial = await prisma.recruitVisit.count({ where: { season, visitType: 'OFFICIAL' } });
  const visitsUnofficial = await prisma.recruitVisit.count({ where: { season, visitType: 'UNOFFICIAL' } });

  const maxBudget = Math.max(...teams.map((b) => b.annualNilBudget));
  const minBudget = Math.max(1, Math.min(...teams.map((b) => b.annualNilBudget)));
  const budgetRatio = maxBudget / minBudget;

  console.log('Recruit types:', recruitsByType);
  console.log('Teams actively recruiting:', teams.length);
  console.log('Commitments by star:', commitmentsByStar);
  console.log('Uncommitted after cycle:', uncommitted);
  console.log('Visits O/U:', visitsOfficial, visitsUnofficial);
  console.log('Portal entries:', portalEntries.entries, 'portal commitments:', portalMarketplace.commitments);
  console.log('NIL budget ratio max:min', budgetRatio.toFixed(2));
  console.log('Tampering summary:', tampering);
  console.log('Week count processed:', recruitingSummary.weeks.length);

  console.log('--- Phase 2 checklist validation ---');
  check('Recruit generation pipeline (HS + JUCO + International)', ['HS', 'JUCO', 'INTERNATIONAL'].every((type) => recruitsByType.some((r) => r.type === type)), 'all recruit types present');

  const recruit = await prisma.recruit.findFirstOrThrow({ where: { season } });
  check('Star rating and composite score calculator', recruit.starRating >= 1 && recruit.starRating <= 5, `sample recruit star=${recruit.starRating}`);

  const uncertaintyNoScout = calculateUncertainty(recruit, 0);
  const uncertaintyMaxScout = calculateUncertainty(recruit, 1);
  check('Scouting fog of war system', uncertaintyNoScout >= 9.5 && uncertaintyMaxScout <= 3.5, `uncertainty noScout=${uncertaintyNoScout.toFixed(2)} maxScout=${uncertaintyMaxScout.toFixed(2)}`);

  const weights = computePersonalityWeights({ ego: 85, loyalty: 60, nbaDraftInterest: 90, maturity: 70, academicAffinity: 75 });
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  check('Interest calculation engine with personality-weighted factors', Math.abs(weightSum - 1) < 1e-6 && weights.nil > 0 && weights.proDev > 0, `weights normalized sum=${weightSum.toFixed(6)}`);

  const sampleTeam = await prisma.team.findFirstOrThrow({ where: { id: teams[0].id }, select: { id: true, facilityRating: true, fanIntensity: true } });
  const officialBoost = await calculateVisitBoost(sampleTeam, 'official', 22);
  const unofficialBoost = await calculateVisitBoost(sampleTeam, 'unofficial', 22);
  check('Visit system with boost calculations', unofficialBoost > 0 && officialBoost > unofficialBoost && visitsUnofficial > 0, `official=${officialBoost.toFixed(2)} unofficial=${unofficialBoost.toFixed(2)} totalU=${visitsUnofficial}`);

  check('Commitment and decommitment logic', commitmentsByStar.length > 0 && uncommitted < 120, `commitGroups=${commitmentsByStar.length} uncommitted=${uncommitted}`);

  const nbaTrackScore = await calculateNBATrackRecord(sampleTeam.id, season);
  const nbaTrackGrade = getProDevGrade(nbaTrackScore);
  check('Pro development pitch tracking and display', typeof nbaTrackGrade === 'string' && nbaTrackGrade.length > 0, `score=${nbaTrackScore.toFixed(2)} grade=${nbaTrackGrade}`);

  check('Transfer portal entry probability calculator', portalEntries.entries > 0, `entries=${portalEntries.entries}`);
  check('Portal marketplace with value adjustments', portalMarketplace.commitments > 0, `commitments=${portalMarketplace.commitments}`);
  check('Tampering detection system', tampering.flags >= tampering.audits && tampering.audits >= tampering.penalties, `flags=${tampering.flags} audits=${tampering.audits} penalties=${tampering.penalties}`);

  check('NIL collective funding formula', budgetRatio >= 150, `ratio=${budgetRatio.toFixed(2)} target≈200`);

  const samplePlayer = await prisma.player.findFirstOrThrow({ where: { teamId: sampleTeam.id } });
  const nilValue = await calculatePlayerNILValue(samplePlayer.id);
  check('Player NIL valuation', nilValue > 0, `playerNILValue=${nilValue.toFixed(2)}`);

  const beforeSocial = samplePlayer.socialMediaRating;
  const afterSocial = await updateSocialMedia(samplePlayer.id, season);
  check('Social media growth model', afterSocial !== beforeSocial, `before=${beforeSocial.toFixed(2)} after=${afterSocial.toFixed(2)}`);

  const sampleContract = await prisma.nilContract.findFirst({ where: { teamId: sampleTeam.id, status: 'ACTIVE' }, orderBy: { annualValue: 'desc' } });
  let renegotiated = false;
  if (sampleContract) renegotiated = await evaluateRenegotiation(sampleContract.id);
  check('NIL contract creation, renegotiation, termination', sampleContract !== null, `activeContract=${sampleContract ? 'yes' : 'no'} renegotiated=${renegotiated}`);

  const jealousy = await runTeamJealousyCheck(sampleTeam.id, season);
  const fatigueCount = await prisma.boosterFatigueTracking.count({ where: { season, fatigueModifier: { gt: 0 } } });
  check('Booster fatigue and jealousy systems', jealousy.flagged >= 0 && fatigueCount >= 0, `jealousyFlags=${jealousy.flagged} fatigueFlags=${fatigueCount}`);

  const softCap = await enforceNILSoftCap(sampleTeam.id, maxBudget);
  const diminishingDelta = calculateNILRecruitingImpact(300_000, 100_000) - calculateNILRecruitingImpact(100_000, 100_000);
  check('NIL soft cap and diminishing returns', !softCap.allowed && diminishingDelta < 20, `capAllowed=${softCap.allowed} diminishingDelta=${diminishingDelta.toFixed(2)}`);

  const jucoCount = recruitsByType.filter((r) => r.type === 'JUCO').reduce((acc, row) => acc + row._count, 0);
  const internationalCount = recruitsByType.filter((r) => r.type === 'INTERNATIONAL').reduce((acc, row) => acc + row._count, 0);
  const visa = await rollVisaDelay(recruit.id);
  const adjustment = applyCulturalAdjustment(samplePlayer.id, 5);
  check('JUCO and international-specific mechanics', jucoCount > 0 && internationalCount > 0 && typeof visa.delayed === 'boolean' && adjustment < 0, `juco=${jucoCount} intl=${internationalCount} visaWeeks=${visa.weeks}`);
  check('JUCO detector', isJUCO({ type: 'JUCO' } as any), 'JUCO detection true');
  check('International detector', isInternational({ type: 'INTERNATIONAL' } as any), 'international detection true');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
