import { prisma } from './api/routes/_db';
import { runFullRecruitingCycle } from './systems/recruiting/calendar';
import { runPostseasonPortalEvaluation } from './systems/portal/entry';
import { runPortalMarketplace } from './systems/portal/marketplace';
import { recalculateAllNILBudgets } from './systems/nil/collective';
import { runAINILAllocation } from './systems/nil/contracts';
import { applyFatigueToAllTeams } from './systems/nil/boosterFatigue';
import { runTamperingAudits } from './systems/portal/tampering';

async function main() {
  const season = 1;
  console.log('=== Phase 2 verification start ===');

  await recalculateAllNILBudgets(season);
  const teams = await prisma.team.findMany({ select: { id: true } });
  for (const t of teams.slice(0, 40)) await runAINILAllocation(t.id, season);

  const recruitingSummary = await runFullRecruitingCycle(season);
  const portalEntries = await runPostseasonPortalEvaluation(season);
  const portalMarketplace = await runPortalMarketplace(season);
  await applyFatigueToAllTeams(season);
  const tampering = await runTamperingAudits(season);

  const recruitsByType = await prisma.recruit.groupBy({ by: ['type', 'starRating'], where: { season }, _count: true });
  const commitmentsByStar = await prisma.recruit.groupBy({ by: ['starRating'], where: { season, signedTeamId: { not: null } }, _count: true });
  const uncommitted = await prisma.recruit.count({ where: { season, signedTeamId: null } });
  const visitsOfficial = await prisma.recruitVisit.count({ where: { season, visitType: 'OFFICIAL' } });
  const visitsUnofficial = await prisma.recruitVisit.count({ where: { season, visitType: 'UNOFFICIAL' } });
  const budgets = await prisma.team.findMany({ select: { annualNilBudget: true } });
  const maxBudget = Math.max(...budgets.map((b) => b.annualNilBudget));
  const minBudget = Math.max(1, Math.min(...budgets.map((b) => b.annualNilBudget)));

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
