import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useUserTeam } from '../../context/UserTeamContext';
import { useApi } from '../../hooks/useApi';

type Team = { id: number; conferenceId: number; name: string };
type Conf = { id: number; name: string; shortName?: string };
type Tournament = { conferenceId: number; season: number; winnerTeamId?: number | null; format: string };

export default function ConferenceTournament() {
  const { state } = useSeasonState();
  const { userTeamId } = useUserTeam();
  const teams = useApi<Team[]>('/api/teams');
  const confs = useApi<Conf[]>('/api/conferences');

  const userConferenceId = (teams.data ?? []).find((t) => t.id === userTeamId)?.conferenceId ?? (confs.data?.[0]?.id ?? 1);
  const tournament = useApi<Tournament | null>(`/api/postseason/conf-tournament/${userConferenceId}/${state.season}`);

  if (teams.loading || confs.loading || tournament.loading) return <div>Loading...</div>;
  if (teams.error || confs.error || tournament.error) return <div>Error: {teams.error ?? confs.error ?? tournament.error}</div>;

  const confName = (confs.data ?? []).find((c) => c.id === userConferenceId)?.shortName ?? (confs.data ?? []).find((c) => c.id === userConferenceId)?.name ?? `Conference ${userConferenceId}`;
  const winnerName = tournament.data?.winnerTeamId ? (teams.data ?? []).find((t) => t.id === tournament.data?.winnerTeamId)?.name ?? `Team ${tournament.data?.winnerTeamId}` : 'TBD';

  return <div className="card"><h2 className="text-xl font-semibold mb-2">Conference Tournament</h2><DataTable headers={['Conference', 'Format', 'Winner']} rows={[[confName, tournament.data?.format ?? '-', winnerName]]} /></div>;
}
