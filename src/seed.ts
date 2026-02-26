import { PrismaClient } from '@prisma/client';
import { generateConferences } from './generators/conferences';
import { generateTeams } from './generators/teams';
import { generatePlayersForTeams } from './generators/players';
import { generateCoachesForTeams } from './generators/coaches';
import { generateRecruitClass } from './pipelines/recruitClass';

const prisma = new PrismaClient();

async function seed() {
  console.log('Clearing existing data...');
  // Phase 2 tables that reference core entities must be cleared first
  // to avoid FK restrict errors during reseed.
  await prisma.recruitInterest.deleteMany();
  await prisma.recruitVisit.deleteMany();
  await prisma.recruitScouting.deleteMany();
  await prisma.recruitOffer.deleteMany();
  await prisma.portalEntry.deleteMany();
  await prisma.nilOffer.deleteMany();
  await prisma.tamperingLog.deleteMany();
  await prisma.teamRecruitingBoard.deleteMany();
  await prisma.boosterFatigueTracking.deleteMany();

  await prisma.playerGameStat.deleteMany();
  await prisma.gameLog.deleteMany();
  await prisma.nilContract.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.award.deleteMany();
  await prisma.rankingsHistory.deleteMany();
  await prisma.seasonRecord.deleteMany();
  await prisma.coachingChange.deleteMany();
  await prisma.conferenceMembershipHistory.deleteMany();
  await prisma.sanction.deleteMany();
  await prisma.draftHistory.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.recruit.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.conference.deleteMany();

  const teamSeeds = generateTeams();
  const teamCountByConf = teamSeeds.reduce<Record<string, number>>((acc, t) => {
    acc[t.conferenceKey] = (acc[t.conferenceKey] ?? 0) + 1;
    return acc;
  }, {});

  const conferenceSeeds = generateConferences(teamCountByConf);
  await prisma.conference.createMany({ data: conferenceSeeds });
  const conferences = await prisma.conference.findMany();
  const byShort = Object.fromEntries(conferences.map((c) => [c.shortName ?? c.name, c]));

  await prisma.team.createMany({
    data: teamSeeds.map((t) => ({
      name: t.name,
      abbreviation: t.abbreviation,
      mascot: t.mascot,
      conferenceId: (byShort[t.conferenceKey] ?? conferences.find((c) => c.tier === 'LOW_MAJOR'))!.id,
      currentPrestige: t.currentPrestige,
      historicalPrestige: t.historicalPrestige,
      facilityRating: t.facilityRating,
      nilCollectiveStrength: t.nilCollectiveStrength,
      boosterBudget: t.boosterBudget,
      mediaMarket: t.mediaMarket,
      fanIntensity: t.fanIntensity,
      arenaCapacity: t.arenaCapacity,
      academicRating: t.academicRating,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      rivalries: t.rivalries,
      tourneySuccessScore: t.currentPrestige,
      mediaBuzz: t.mediaMarket,
      rolling10YearPrestige: t.historicalPrestige
    }))
  });

  const teams = await prisma.team.findMany();
  const players = generatePlayersForTeams(teams);
  await prisma.player.createMany({ data: players });

  const { heads, assistants } = generateCoachesForTeams(teams);
  await prisma.coach.createMany({ data: heads });
  await prisma.coach.createMany({ data: assistants });

  await generateRecruitClass(1, prisma);

  console.log(`Seed complete. Conferences: ${conferences.length}, Teams: ${teams.length}, Players: ${players.length}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
