import { TeamTier } from '@prisma/client';
import { clampedNormal } from '../utils/random';

export type ConferenceSeed = {
  name: string;
  shortName: string;
  tier: TeamTier;
  prestige: number;
  mediaDealValue: number;
  tournamentFormat: string;
  autoBidValue: number;
  memberCount: number;
};

const conferenceDefs: Array<{ name: string; shortName: string; tier: TeamTier }> = [
  ['Atlantic Coast Conference','ACC','POWER4'],['Big Ten Conference','B1G','POWER4'],['Big 12 Conference','B12','POWER4'],['Southeastern Conference','SEC','POWER4'],
  ['Big East Conference','BE','UPPER_MID'],['American Athletic Conference','AAC','UPPER_MID'],['Atlantic 10 Conference','A10','UPPER_MID'],['Mountain West Conference','MW','UPPER_MID'],
  ['Missouri Valley Conference','MVC','MID'],['West Coast Conference','WCC','MID'],['Conference USA','CUSA','MID'],['Sun Belt Conference','SBC','MID'],
  ['Mid-American Conference','MAC','MID'],['Southern Conference','SoCon','MID'],['Ivy League','Ivy','MID'],['Summit League','Summit','MID'],
  ['Horizon League','Horizon','LOW_MAJOR'],['Big Sky Conference','Big Sky','LOW_MAJOR'],['Big West Conference','Big West','LOW_MAJOR'],['Northeast Conference','NEC','LOW_MAJOR'],
  ['Patriot League','Patriot','LOW_MAJOR'],['America East Conference','AE','LOW_MAJOR'],['Southland Conference','Southland','LOW_MAJOR'],['Ohio Valley Conference','OVC','LOW_MAJOR'],
  ['Colonial Athletic Association','CAA','LOW_MAJOR'],['Metro Atlantic Athletic Conference','MAAC','LOW_MAJOR'],['Western Athletic Conference','WAC','LOW_MAJOR'],['ASUN Conference','ASUN','LOW_MAJOR'],
  ['SWAC','SWAC','LOW_MAJOR'],['MEAC','MEAC','LOW_MAJOR'],['Big South Conference','Big South','LOW_MAJOR'],['The Summit Frontier','Frontier','LOW_MAJOR']
].map(([name, shortName, tier]) => ({ name, shortName, tier: tier as TeamTier }));

const tierRanges: Record<TeamTier, { prestige: [number, number, number]; media: [number, number, number]; autoBid: [number, number, number] }> = {
  POWER4: { prestige: [82, 6, 65], media: [88, 7, 70], autoBid: [92, 4, 80] },
  UPPER_MID: { prestige: [70, 5, 58], media: [62, 6, 45], autoBid: [75, 5, 60] },
  MID: { prestige: [60, 5, 48], media: [49, 5, 35], autoBid: [62, 5, 45] },
  LOW_MAJOR: { prestige: [47, 6, 30], media: [34, 6, 18], autoBid: [50, 6, 30] }
};

export function generateConferences(teamCountByConference: Record<string, number>): ConferenceSeed[] {
  return conferenceDefs.map((conf) => {
    const ranges = tierRanges[conf.tier];
    return {
      name: conf.name,
      shortName: conf.shortName,
      tier: conf.tier,
      prestige: clampedNormal(ranges.prestige[0], ranges.prestige[1], ranges.prestige[2], 99),
      mediaDealValue: clampedNormal(ranges.media[0], ranges.media[1], ranges.media[2], 99),
      tournamentFormat: conf.tier === 'POWER4' ? '20-game round robin + conf tournament' : '18-game conference slate + tournament',
      autoBidValue: clampedNormal(ranges.autoBid[0], ranges.autoBid[1], ranges.autoBid[2], 99),
      memberCount: teamCountByConference[conf.shortName] ?? teamCountByConference[conf.name] ?? 11
    };
  });
}
