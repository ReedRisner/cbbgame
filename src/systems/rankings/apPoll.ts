import { prisma } from '../../api/routes/_db';
import { calculateAPVoterScore } from '../../formulas/rankings';
import { calculatePreseasonScore } from '../../formulas/postseason';

export type APPollResult = { rank: number; teamId: number; points: number; firstPlaceVotes: number; prevRank: number | null };

export async function seedAPVoters(): Promise<void> {
  if (await prisma.apVoter.count()) return;
  const conferences = await prisma.conference.findMany();
  for (let i = 0; i < 65; i += 1) {
    await prisma.apVoter.create({
      data: {
        name: `AP Voter ${i + 1}`,
        conferenceBias1Id: conferences[i % conferences.length]?.id,
        conferenceBias1Strength: (Math.random() * 6) - 3,
        preseasonWeight: 0.1 + (Math.random() * 0.3),
      },
    });
  }
}

export async function getPreseasonPoll(season: number): Promise<APPollResult[]> {
  await seedAPVoters();
  const teams = await prisma.team.findMany({ include: { players: true } });
  const ranked = teams.map((t) => ({
    teamId: t.id,
    score: calculatePreseasonScore(t.currentPrestige, t.players.reduce((s, p) => s + p.overall, 0) / Math.max(1, t.players.length), 50, 50),
  })).sort((a, b) => b.score - a.score).slice(0, 25);

  return ranked.map((r, i) => ({ rank: i + 1, teamId: r.teamId, points: 25 - i, firstPlaceVotes: i === 0 ? 5 : 0, prevRank: null }));
}

export async function runAPPoll(season: number, week: number): Promise<APPollResult[]> {
  await seedAPVoters();
  const teams = await prisma.team.findMany({ include: { seasonRecords: { where: { season } }, conference: true } });
  const netMap = new Map((await prisma.efficiencyRating.findMany({ where: { season, week } })).map((r) => [r.teamId, r.overallRating]));

  const ranked = teams.map((t) => {
    const rec = t.seasonRecords[0];
    const winPct = ((rec?.wins ?? 0) / Math.max(1, (rec?.wins ?? 0) + (rec?.losses ?? 0))) * 25;
    const score = calculateAPVoterScore(winPct, (netMap.get(t.id) ?? 0) + 12.5, rec?.sos ?? 50, 8, 6, 0);
    return { teamId: t.id, score };
  }).sort((a, b) => b.score - a.score).slice(0, 25);

  const prev = await prisma.apPoll.findMany({ where: { season, week: Math.max(0, week - 1) } });
  const prevMap = new Map(prev.map((p) => [p.teamId, p.rank]));
  await prisma.apPoll.deleteMany({ where: { season, week } });

  const results: APPollResult[] = [];
  for (let i = 0; i < ranked.length; i += 1) {
    const row = { rank: i + 1, teamId: ranked[i].teamId, points: Math.round((25 - i) * 65), firstPlaceVotes: i === 0 ? 65 : 0, prevRank: prevMap.get(ranked[i].teamId) ?? null };
    results.push(row);
    await prisma.apPoll.create({ data: { season, week, teamId: row.teamId, rank: row.rank, points: row.points, firstPlaceVotes: row.firstPlaceVotes, prevRank: row.prevRank } });
  }
  return results;
}
