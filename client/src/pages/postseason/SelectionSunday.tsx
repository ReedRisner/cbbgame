import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useUserTeam } from '../../context/UserTeamContext';
import { useApi } from '../../hooks/useApi';

type Team = { id: number; name: string };
type Row = { teamId: number; projectedSeed: number | null; projectedRegion: string | null; bubbleStatus: string; resumeScore: number };

export default function SelectionSunday() {
  const { state } = useSeasonState();
  const { userTeamId } = useUserTeam();
  const bracket = useApi<Row[]>(`/api/rankings/bracketology/${state.season}/${state.week}`);
  const teams = useApi<Team[]>('/api/teams');

  if (bracket.loading || teams.loading) return <div>Loading...</div>;
  if (bracket.error) return <div>Error: {bracket.error}</div>;

  const teamMap = new Map((teams.data ?? []).map((t) => [t.id, t.name]));
  const field = (bracket.data ?? []).slice(0, 68);
  const mine = field.find((r) => r.teamId === userTeamId);

  return (
    <div className="space-y-3">
      <div className="card"><h2 className="text-xl font-semibold">Selection Sunday</h2><p>Your status: {mine ? `${mine.projectedSeed ?? '-'} seed (${mine.projectedRegion ?? 'N/A'})` : 'Outside projected field'}</p></div>
      <div className="card"><DataTable headers={['Team', 'Seed', 'Region', 'Type']} rows={field.map((r) => [teamMap.get(r.teamId) ?? r.teamId, r.projectedSeed ?? '-', r.projectedRegion ?? '-', r.bubbleStatus])} /></div>
    </div>
  );
}
