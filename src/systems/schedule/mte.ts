import { prisma } from '../../api/routes/_db';

const TIERS = [
  { tier: 'ELITE', count: 5, teamMin: 70, teamMax: 100 },
  { tier: 'HIGH', count: 7, teamMin: 50, teamMax: 80 },
  { tier: 'MID', count: 8, teamMin: 30, teamMax: 60 },
  { tier: 'LOW', count: 5, teamMin: 0, teamMax: 40 },
] as const;

export type MTEEvent = { id: number; name: string; season: number; prestigeTier: string; location: string; neutralSite: boolean };

export async function generateMTEs(season: number): Promise<MTEEvent[]> {
  const locations = ['Maui', 'Atlantis', 'Orlando', 'Las Vegas', 'Nashville', 'Brooklyn'];
  const created: MTEEvent[] = [];
  for (const t of TIERS) {
    for (let i = 0; i < t.count; i += 1) {
      const event = await prisma.mteEvent.create({
        data: {
          season,
          name: `${t.tier} MTE ${i + 1}`,
          prestigeTier: t.tier,
          location: locations[(i + season) % locations.length],
          neutralSite: true,
        },
      });
      created.push(event as MTEEvent);
    }
  }
  return created;
}

export async function assignTeamsToMTEs(season: number): Promise<void> {
  const events = await prisma.mteEvent.findMany({ where: { season }, orderBy: { id: 'asc' } });
  const teams = await prisma.team.findMany({ orderBy: { currentPrestige: 'desc' } });
  const assigned = new Set<number>();

  for (const event of events) {
    const size = event.prestigeTier === 'LOW' ? 16 : 8;
    const bucket = teams.filter((t) => {
      if (assigned.has(t.id)) return false;
      if (event.prestigeTier === 'ELITE') return t.currentPrestige >= 70;
      if (event.prestigeTier === 'HIGH') return t.currentPrestige >= 50 && t.currentPrestige <= 85;
      if (event.prestigeTier === 'MID') return t.currentPrestige >= 30 && t.currentPrestige <= 65;
      return t.currentPrestige < 45;
    });

    const picks = bucket.slice(0, size);
    for (let i = 0; i < picks.length; i += 1) {
      await prisma.mteParticipant.create({ data: { mteId: event.id, teamId: picks[i].id, seed: i + 1 } });
      assigned.add(picks[i].id);
    }
  }
}
