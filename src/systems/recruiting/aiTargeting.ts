import { prisma } from '../../api/routes/_db';

export type RecruitBoardEntry = { recruitId: number; priorityRank: number; scoutingInvestment: number; priorityScore: number };

function targetPriority(positionNeed: number, talentGap: number, schemeFit: number, gettability: number): number {
  return positionNeed * 0.35 + talentGap * 0.3 + schemeFit * 0.2 + gettability * 0.15;
}

export async function buildRecruitBoard(teamId: number, season: number): Promise<RecruitBoardEntry[]> {
  const [teamPlayers, recruits, coach] = await Promise.all([
    prisma.player.findMany({ where: { teamId } }),
    prisma.recruit.findMany({ where: { season, signedTeamId: null } }),
    prisma.coach.findFirst({ where: { teamId, role: 'HEAD' } }),
  ]);

  const byPos = new Map<string, number>();
  teamPlayers.forEach((p) => byPos.set(p.position, (byPos.get(p.position) ?? 0) + 1));
  const recruitingSkill = coach?.recruiting ?? 50;

  const scored = recruits.map((recruit) => {
    const positionNeed = Math.max(0, 100 - (byPos.get(recruit.position) ?? 0) * 25);
    const talentGap = Math.max(0, recruit.scoutedOverall - 65);
    const schemeFit = 60;
    const gettabilityNoise = ((100 - recruitingSkill) / 100) * (Math.random() * 10 - 5);
    const gettability = Math.max(0, 70 - recruit.starRating * 8 + gettabilityNoise);
    return {
      recruitId: recruit.id,
      priorityScore: targetPriority(positionNeed, talentGap, schemeFit, gettability),
    };
  });

  const activeSize = Math.min(25, Math.max(15, Math.round(15 + recruitingSkill / 10)));
  const top = scored.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, activeSize);
  return top.map((entry, i) => ({
    ...entry,
    priorityRank: i + 1,
    scoutingInvestment: Math.max(0.05, (activeSize - i) / ((activeSize * (activeSize + 1)) / 2)),
  }));
}

export async function runAIRecruiting(teamId: number, season: number, week: number): Promise<void> {
  const board = await buildRecruitBoard(teamId, season);

  await prisma.teamRecruitingBoard.deleteMany({ where: { teamId, season } });
  if (!board.length) return;

  await prisma.teamRecruitingBoard.createMany({
    data: board.map((entry) => ({
      teamId,
      recruitId: entry.recruitId,
      season,
      priorityRank: entry.priorityRank,
      scoutingInvestment: entry.scoutingInvestment,
    })),
  });

  for (const entry of board) {
    await prisma.recruitScouting.upsert({
      where: { recruitId_teamId_season: { recruitId: entry.recruitId, teamId, season } },
      create: {
        recruitId: entry.recruitId,
        teamId,
        season,
        investmentLevel: entry.scoutingInvestment,
        currentUncertainty: 10,
      },
      update: { investmentLevel: entry.scoutingInvestment },
    });

    if (entry.priorityRank <= 5 && week >= 17) {
      await prisma.recruitVisit.create({
        data: {
          recruitId: entry.recruitId,
          teamId,
          visitType: 'OFFICIAL',
          season,
          week,
          boostApplied: 0,
        },
      }).catch(() => undefined);
    }
  }
}
