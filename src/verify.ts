import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function stats(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return { min, max, mean, stddev: Math.sqrt(variance) };
}

async function verify() {
  const teams = await prisma.team.findMany({ include: { conference: true } });
  const players = await prisma.player.findMany({ include: { team: true } });
  const coaches = await prisma.coach.findMany();
  const conferences = await prisma.conference.findMany();
  const recruits = await prisma.recruit.findMany({ where: { season: 1 } });

  const tierBreakdown = teams.reduce<Record<string, number>>((acc, t) => {
    acc[t.conference.tier] = (acc[t.conference.tier] ?? 0) + 1;
    return acc;
  }, {});
  const posBreakdown = players.reduce<Record<string, number>>((acc, p) => {
    acc[p.position] = (acc[p.position] ?? 0) + 1;
    return acc;
  }, {});
  const classBreakdown = players.reduce<Record<string, number>>((acc, p) => {
    acc[p.classYear] = (acc[p.classYear] ?? 0) + 1;
    return acc;
  }, {});

  const overallByTier = players.reduce<Record<string, number[]>>((acc, p) => {
    const tier = p.team.currentPrestige >= 75 ? 'POWER' : p.team.currentPrestige >= 62 ? 'UPPER' : p.team.currentPrestige >= 50 ? 'MID' : 'LOW';
    (acc[tier] ??= []).push(p.trueOverall);
    return acc;
  }, {});

  const recruitByStars = recruits.reduce<Record<string, number>>((acc, r) => {
    acc[`${r.type}-${r.starRating}★`] = (acc[`${r.type}-${r.starRating}★`] ?? 0) + 1;
    return acc;
  }, {});

  console.log('Total teams:', teams.length, teams.length >= 362 ? 'OK' : 'FLAG');
  console.log('Tier breakdown:', tierBreakdown);
  console.log('Total players:', players.length, players.length >= 4300 && players.length <= 5000 ? 'OK' : 'FLAG');
  console.log('Players by position:', posBreakdown);
  console.log('Players by class year:', classBreakdown);
  console.log('Average overall by prestige tier:', Object.fromEntries(Object.entries(overallByTier).map(([k, v]) => [k, (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)])));
  console.log('Total coaches:', coaches.length, coaches.length === 1810 ? 'OK' : 'FLAG');
  console.log('Conferences:', conferences.length, conferences.length === 32 ? 'OK' : 'FLAG');
  console.log('Average conference size:', (teams.length / conferences.length).toFixed(2));
  console.log('Recruit class by star/type:', recruitByStars);

  const prestigeByTier = teams.reduce<Record<string, number[]>>((acc, t) => {
    (acc[t.conference.tier] ??= []).push(t.currentPrestige);
    return acc;
  }, {});

  Object.entries(prestigeByTier).forEach(([tier, values]) => {
    console.log(`Prestige ${tier}:`, stats(values));
  });
}

verify()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
