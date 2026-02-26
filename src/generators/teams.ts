import rawTeams from '../../teams.json';
import { TeamTier } from '@prisma/client';
import { clampedNormal, weightedChoice } from '../utils/random';

export type TeamSeed = {
  name: string;
  abbreviation: string;
  mascot: string;
  conferenceKey: string;
  currentPrestige: number;
  historicalPrestige: number;
  facilityRating: number;
  nilCollectiveStrength: number;
  boosterBudget: number;
  mediaMarket: number;
  fanIntensity: number;
  arenaCapacity: number;
  academicRating: number;
  primaryColor: string;
  secondaryColor: string;
  rivalries: Array<{ team: string; intensity: number }>;
};

type TeamJson = { team: string; abr: string; colors: string[]; conference: string; mascot: string };

const confAlias: Record<string, string> = {
  'A-10': 'A10','AAC': 'AAC','ACC': 'ACC','ASUN': 'ASUN','America East': 'AE','Big 12': 'B12','Big East': 'BE','Big Sky': 'Big Sky','Big South': 'Big South',
  'Big Ten': 'B1G','Big West': 'Big West','CAA': 'CAA','C-USA': 'CUSA','Horizon': 'Horizon','Ivy': 'Ivy','MAAC': 'MAAC','MAC': 'MAC','MEAC': 'MEAC',
  'MVC': 'MVC','MWC': 'MW','NEC': 'NEC','OVC': 'OVC','Pac-12': 'WCC','Patriot': 'Patriot','SEC': 'SEC','SOCON': 'SoCon','Southland': 'Southland',
  'Summit': 'Summit','Sun Belt': 'SBC','SWAC': 'SWAC','WAC': 'WAC','WCC': 'WCC'
};

const tierByConf: Record<string, TeamTier> = {
  ACC: 'POWER4', B1G: 'POWER4', B12: 'POWER4', SEC: 'POWER4',
  BE: 'UPPER_MID', AAC: 'UPPER_MID', A10: 'UPPER_MID', MW: 'UPPER_MID',
  MVC: 'MID', WCC: 'MID', CUSA: 'MID', SBC: 'MID', MAC: 'MID', SoCon: 'MID', Ivy: 'MID', Summit: 'MID'
};

const ranges: Record<TeamTier, { prestige: [number, number, number]; hist: [number, number, number]; facility: [number, number, number] }> = {
  POWER4: { prestige: [80, 8, 58], hist: [83, 7, 60], facility: [80, 8, 60] },
  UPPER_MID: { prestige: [67, 7, 50], hist: [66, 8, 45], facility: [68, 8, 48] },
  MID: { prestige: [57, 7, 38], hist: [56, 7, 35], facility: [56, 7, 36] },
  LOW_MAJOR: { prestige: [44, 7, 25], hist: [43, 8, 20], facility: [45, 8, 25] }
};

function teamTier(confKey: string): TeamTier {
  return tierByConf[confKey] ?? 'LOW_MAJOR';
}

export function generateTeams(): TeamSeed[] {
  const teams = rawTeams as TeamJson[];
  return teams.map((t, i) => {
    const conferenceKey = confAlias[t.conference] ?? t.conference;
    const tier = teamTier(conferenceKey);
    const r = ranges[tier];
    const rivalryCount = weightedChoice([1, 2, 3], [45, 40, 15]);
    const rivalries = Array.from({ length: rivalryCount }, (_, idx) => ({
      team: teams[(i + (idx + 3) * 17) % teams.length].team,
      intensity: clampedNormal(65, 20, 20, 99)
    }));

    return {
      name: t.team,
      abbreviation: t.abr,
      mascot: t.mascot,
      conferenceKey,
      currentPrestige: clampedNormal(r.prestige[0], r.prestige[1], r.prestige[2], 98),
      historicalPrestige: clampedNormal(r.hist[0], r.hist[1], r.hist[2], 99),
      facilityRating: clampedNormal(r.facility[0], r.facility[1], r.facility[2], 97),
      nilCollectiveStrength: clampedNormal((r.prestige[0] + 5), 10, 20, 99),
      // Phase 2 NIL calibration: widened tier separation to better approximate the target ~200:1
      // annual budget ratio between top blue-blood programs and low-major programs while still
      // preserving overlap via normal sampling noise.
      boosterBudget: clampedNormal(tier === 'POWER4' ? 94 : tier === 'UPPER_MID' ? 70 : tier === 'MID' ? 34 : 7, 10, 1, 99),
      mediaMarket: clampedNormal(tier === 'POWER4' ? 86 : tier === 'UPPER_MID' ? 60 : tier === 'MID' ? 38 : 14, 14, 1, 99),
      fanIntensity: clampedNormal(tier === 'POWER4' ? 88 : tier === 'UPPER_MID' ? 64 : tier === 'MID' ? 43 : 18, 12, 1, 99),
      arenaCapacity: Math.round(clampedNormal(tier === 'POWER4' ? 16500 : tier === 'UPPER_MID' ? 12000 : tier === 'MID' ? 9000 : 6500, 2400, 3500, 25000)),
      academicRating: clampedNormal(62, 16, 20, 99),
      primaryColor: `#${t.colors[0]}`,
      secondaryColor: `#${t.colors[1]}`,
      rivalries
    };
  });
}
