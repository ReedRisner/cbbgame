import { prisma } from '../../api/routes/_db';
import { runAIRecruiting } from './aiTargeting';
import { recalculateRecruitInterestForTeam } from './interest';
import { evaluateCommitment } from './commitment';
import { evaluateDecommitment } from './decommit';

export type WeekSummary = {
  season: number;
  week: number;
  aiTeamsProcessed: number;
  interestsUpdated: number;
  commitments: number;
  decommitments: number;
};

export type SeasonRecruitingSummary = {
  season: number;
  weeks: WeekSummary[];
};

export async function advanceRecruitingWeek(season: number, week: number): Promise<WeekSummary> {
  const teams = await prisma.team.findMany({ select: { id: true } });
  for (const team of teams) {
    await runAIRecruiting(team.id, season, week);
  }

  const boardEntries = await prisma.teamRecruitingBoard.findMany({ where: { season } });
  let interestsUpdated = 0;
  for (const entry of boardEntries) {
    await recalculateRecruitInterestForTeam(entry.recruitId, entry.teamId, season, week);
    interestsUpdated += 1;
  }

  const recruits = await prisma.recruit.findMany({ where: { season } });
  let commitments = 0;
  let decommitments = 0;
  for (const recruit of recruits) {
    const commit = await evaluateCommitment(recruit.id, season, week);
    if (commit) commitments += 1;
    const decommit = await evaluateDecommitment(recruit.id, season, week);
    if (decommit) decommitments += 1;
  }

  return { season, week, aiTeamsProcessed: teams.length, interestsUpdated, commitments, decommitments };
}

export async function runFullRecruitingCycle(season: number): Promise<SeasonRecruitingSummary> {
  const weeks: WeekSummary[] = [];
  for (let week = 1; week <= 36; week += 1) {
    weeks.push(await advanceRecruitingWeek(season, week));
  }
  return { season, weeks };
}
