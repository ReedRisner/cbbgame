import { useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useUserTeam } from '../../context/UserTeamContext';
import { useApi } from '../../hooks/useApi';

type B = { teamId: number; projectedSeed: number | null; projectedRegion: string | null; bubbleStatus: string; resumeScore: number };
type Team = { id: number; name: string };

export default function Bracketology() {
  const { state } = useSeasonState();
  const { userTeamId } = useUserTeam();
  const rows = useApi<B[]>(`/api/rankings/bracketology/${state.season}/${state.week}`);
  const teams = useApi<Team[]>('/api/teams');
  const teamMap = useMemo(() => new Map((teams.data ?? []).map((t) => [t.id, t.name])), [teams.data]);

  if (rows.loading || teams.loading) return <div>Loading...</div>;
  if (rows.error) return <div>Error: {rows.error}</div>;

  const me = (rows.data ?? []).find((r) => r.teamId === userTeamId);

  return (
    <div className="space-y-3">
      <div className="card"><h2 className="text-xl font-semibold">Bracketology</h2><p className="text-slate-300 mt-1">Your projection: {me ? `${me.projectedSeed ?? '—'} seed (${me.projectedRegion ?? 'N/A'}) · ${me.bubbleStatus}` : 'Not currently projected'}</p></div>
      <div className="card"><DataTable headers={['Team', 'Seed', 'Region', 'Bubble', 'Resume']} rows={(rows.data ?? []).slice(0, 68).map((r) => [teamMap.get(r.teamId) ?? r.teamId, r.projectedSeed ?? '-', r.projectedRegion ?? '-', r.bubbleStatus, r.resumeScore.toFixed(1)])} /></div>
    </div>
  );
}
