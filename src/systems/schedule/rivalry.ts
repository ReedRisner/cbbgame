import { prisma } from '../../api/routes/_db';
import { calculateRivalryIntensityDelta } from '../../formulas/schedule';

export type RivalryEffects = { attendanceBonus: number; homeCourtBoost: number; mediaMultiplier: number; rivalryIntensity: number };

export async function applyRivalryEffects(gameId: number): Promise<RivalryEffects> {
  const game = await prisma.schedule.findUnique({ where: { id: gameId }, include: { homeTeam: true, awayTeam: true } });
  if (!game) throw new Error('Game not found');
  const rivalries = (game.homeTeam.rivalries as any[] | null) ?? [];
  const hit = rivalries.find((r) => Number(r.teamId) === game.awayTeamId);
  const intensity = Math.max(10, Math.min(100, Number(hit?.intensity ?? 0)));
  return {
    attendanceBonus: intensity > 0 ? 0.1 : 0,
    homeCourtBoost: intensity > 0 ? 1.5 : 0,
    mediaMultiplier: intensity > 0 ? 1.5 : 1,
    rivalryIntensity: intensity || 0,
  };
}

export async function updateRivalryIntensity(season: number): Promise<void> {
  const teams = await prisma.team.findMany();
  for (const team of teams) {
    const rivals = ((team.rivalries as any[]) ?? []).map((r) => ({ ...r }));
    for (const r of rivals) {
      const sameConference = (await prisma.team.findUnique({ where: { id: Number(r.teamId) } }))?.conferenceId === team.conferenceId;
      const delta = calculateRivalryIntensityDelta(0, Boolean(sameConference), 0) - 1;
      r.intensity = Math.max(10, Math.min(100, Number(r.intensity ?? 30) + delta));
      await prisma.rivalryHistory.upsert({
        where: { team1Id_team2Id_season: { team1Id: team.id, team2Id: Number(r.teamId), season } },
        update: { intensityDelta: delta },
        create: { team1Id: team.id, team2Id: Number(r.teamId), season, team1Wins: 0, team2Wins: 0, intensityDelta: delta },
      });
    }
    await prisma.team.update({ where: { id: team.id }, data: { rivalries: rivals } });
  }
}
