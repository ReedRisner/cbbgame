import { prisma } from '../../api/routes/_db';

export type ConfTournamentBracket = { conferenceId: number; season: number; seeds: number[]; format: string; };
export type ConfTournamentResult = { conferenceId: number; championTeamId: number; };

export async function generateConfTournamentBracket(conferenceId: number, season: number): Promise<ConfTournamentBracket> {
  const teams = await prisma.team.findMany({ where: { conferenceId }, orderBy: { currentPrestige: 'desc' } });
  const size = teams.length;
  const format = size <= 8 ? 'SINGLE_ELIM_8' : size <= 12 ? 'SINGLE_ELIM_12_BYES' : size <= 16 ? 'SINGLE_ELIM_16' : 'SINGLE_ELIM_16_PLAYIN';
  const seeds = teams.map((t) => t.id);
  await prisma.conferenceTournament.upsert({
    where: { conferenceId_season: { conferenceId, season } },
    update: { format: format as any, bracketJson: { seeds } },
    create: { conferenceId, season, format: format as any, bracketJson: { seeds } },
  });
  return { conferenceId, season, seeds, format };
}

export async function simulateConfTournament(conferenceId: number, season: number): Promise<ConfTournamentResult> {
  const bracket = await generateConfTournamentBracket(conferenceId, season);
  const championTeamId = bracket.seeds[0];
  await prisma.postseasonResult.upsert({
    where: { season_teamId_tournament: { season, teamId: championTeamId, tournament: 'CONF_TOURNEY' } },
    update: { result: 'Champion' },
    create: { season, teamId: championTeamId, tournament: 'CONF_TOURNEY', result: 'Champion' },
  });
  return { conferenceId, championTeamId };
}
