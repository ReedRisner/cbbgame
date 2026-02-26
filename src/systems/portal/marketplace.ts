import { prisma } from '../../api/routes/_db';
import { calculatePortalPlayerValue, calculatePortalTargetValue } from '../../formulas/portal';
import { calculateInterestDelta, computePersonalityWeights } from '../../formulas/recruiting';

export async function evaluatePortalPlayer(playerId: number, teamId: number): Promise<number> {
  const [player, team] = await Promise.all([
    prisma.player.findUniqueOrThrow({ where: { id: playerId } }),
    prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
  ]);

  const value = calculatePortalPlayerValue({
    currentOverall: player.trueOverall,
    oldTeamSOS: 50,
    fitScore: 0.7,
  });

  return calculatePortalTargetValue({
    playerRating: value,
    rosterPositionAvg: 68,
    needWeight: 1.1,
    ageFactor: player.classYear === 'SO' ? 5 : 2,
    immediateImpact: 8,
  }) + team.currentPrestige * 0.05;
}

export async function runPortalMarketplace(season: number): Promise<{ commitments: number; entries: number }> {
  const entries = await prisma.portalEntry.findMany({ where: { season, status: 'ENTERED' }, include: { player: true } });
  const teams = await prisma.team.findMany({ select: { id: true, currentPrestige: true } });
  let commitments = 0;

  for (const entry of entries) {
    let bestTeamId: number | null = null;
    let bestScore = -Infinity;

    for (const team of teams) {
      const score = await evaluatePortalPlayer(entry.playerId, team.id);
      const weights = computePersonalityWeights({
        ego: entry.player.competitiveness,
        loyalty: entry.player.loyalty,
        nbaDraftInterest: entry.player.nbaPotential,
        maturity: entry.player.discipline,
        academicAffinity: 50,
      });
      const interest = calculateInterestDelta(weights, {
        prestigeFactor: team.currentPrestige,
        distanceFactor: 40,
        ptProjection: 75,
        nilOffer: 65,
        coachCharisma: 60,
        playstyleFit: 60,
        coachDevReputation: 60,
        recentSuccess: 55,
        recruitingEffort: 60,
        nbaTrackRecord: 55,
        academicRating: 50,
      });
      const final = score + interest * 0.5;
      if (final > bestScore) {
        bestScore = final;
        bestTeamId = team.id;
      }
    }

    if (bestTeamId) {
      commitments += 1;
      await prisma.transfer.create({
        data: {
          playerId: entry.playerId,
          fromTeamId: entry.fromTeamId,
          toTeamId: bestTeamId,
          season,
          reason: 'portal',
          immediateEligible: true,
          portalWindow: entry.window,
        },
      });
      await prisma.portalEntry.update({ where: { id: entry.id }, data: { status: 'COMMITTED' } });
    }
  }

  return { commitments, entries: entries.length };
}
