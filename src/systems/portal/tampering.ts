import { prisma } from '../../api/routes/_db';
import { calculateTamperRisk } from '../../formulas/portal';

export async function assessTamperRisk(teamId: number, playerId: number): Promise<number> {
  const [teamCoach, team, player] = await Promise.all([
    prisma.coach.findFirst({ where: { teamId, role: 'HEAD' } }),
    prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
    prisma.player.findUniqueOrThrow({ where: { id: playerId } }),
  ]);

  return calculateTamperRisk({
    coachEthics: teamCoach?.integrity ?? 50,
    nilCollective: team.nilCollectiveStrength,
    playerValue: player.trueOverall,
  });
}

export async function runTamperingAudits(season: number): Promise<{ flags: number; audits: number; penalties: number }> {
  const interactions = await prisma.portalEntry.findMany({ where: { season } });
  let flags = 0;
  let audits = 0;
  let penalties = 0;

  for (const interaction of interactions) {
    const teamId = interaction.fromTeamId;
    const risk = await assessTamperRisk(teamId, interaction.playerId);
    if (risk <= 0) continue;

    flags += 1;
    const audited = Math.random() < 0.05;
    const caught = audited && Math.random() < risk;
    const penaltyApplied = caught;

    if (audited) audits += 1;
    if (penaltyApplied) penalties += 1;

    await prisma.tamperingLog.create({
      data: {
        teamId,
        playerId: interaction.playerId,
        season,
        riskScore: risk,
        audited,
        caught,
        penaltyApplied,
      },
    });
  }

  return { flags, audits, penalties };
}
