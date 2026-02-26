import { useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useApi } from '../../hooks/useApi';

type Net = { teamId: number; netRank: number; quad1Record: string; quad2Record: string; quad3Record: string; quad4Record: string };
type Team = { id: number; name: string };

export default function NETRankings() {
  const { state } = useSeasonState();
  const net = useApi<Net[]>(`/api/rankings/net/${state.season}/${state.week}`);
  const teams = useApi<Team[]>('/api/teams');
  const teamMap = useMemo(() => new Map((teams.data ?? []).map((t) => [t.id, t.name])), [teams.data]);

  if (net.loading || teams.loading) return <div>Loading...</div>;
  if (net.error) return <div>Error: {net.error}</div>;

  return <div className="card"><h2 className="text-xl font-semibold mb-2">NET Rankings</h2><DataTable headers={['NET', 'Team', 'Q1', 'Q2', 'Q3', 'Q4']} rows={(net.data ?? []).map((r) => [r.netRank, teamMap.get(r.teamId) ?? r.teamId, r.quad1Record, r.quad2Record, r.quad3Record, r.quad4Record])} /></div>;
}
