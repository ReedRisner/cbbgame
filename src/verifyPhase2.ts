import { prisma } from './api/routes/_db';
import { runPostseasonPortalEvaluation } from './systems/portal/entry';
import { runPortalMarketplace } from './systems/portal/marketplace';
import { recalculateAllNILBudgets } from './systems/nil/collective';
import { runAINILAllocation } from './systems/nil/contracts';
import { applyFatigueToAllTeams } from './systems/nil/boosterFatigue';
import { runTamperingAudits } from './systems/portal/tampering';
import { advanceRecruitingWeek, runFullRecruitingCycle } from './systems/recruiting/calendar';

async function main() {
  const season = 1;
  const fullMode = process.env.VERIFY_PHASE2_FULL === '1';
  console.log('=== Phase 2 verification start ===');
  console.log(`Mode: ${fullMode ? 'FULL (36 weeks)' : 'FAST (6 weeks)'}`);

  console.log('[1/6] Recalculating NIL budgets...');
  await recalculateAllNILBudgets(season);
  const teams = await prisma.team.findMany({ select: { id: true } });

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

  const db = prisma as any;
  const recruitsByType = await db.recruit.groupBy({ by: ['type', 'starRating'], where: { season }, _count: true });
  const commitmentsByStar = await db.recruit.groupBy({ by: ['starRating'], where: { season, signedTeamId: { not: null } }, _count: true });
  const uncommitted = await db.recruit.count({ where: { season, signedTeamId: null } });
  const visitsOfficial = await db.recruitVisit.count({ where: { season, visitType: 'OFFICIAL' } });
  const visitsUnofficial = await db.recruitVisit.count({ where: { season, visitType: 'UNOFFICIAL' } });
  const budgets = await db.team.findMany({ select: { annualNilBudget: true } });
  const maxBudget = Math.max(...budgets.map((b: any) => b.annualNilBudget));
  const minBudget = Math.max(1, Math.min(...budgets.map((b: any) => b.annualNilBudget)));

  console.log('Recruit types:', recruitsByType);
  console.log('Teams actively recruiting:', teams.length);
  console.log('Commitments by star:', commitmentsByStar);
  console.log('Uncommitted after cycle:', uncommitted);
  console.log('Visits O/U:', visitsOfficial, visitsUnofficial);
  console.log('Portal entries:', portalEntries.entries, 'portal commitments:', portalMarketplace.commitments);
  console.log('NIL budget ratio max:min', (maxBudget / minBudget).toFixed(2));
  console.log('Tampering summary:', tampering);
  console.log('Week count processed:', recruitingSummary.weeks.length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
