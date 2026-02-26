import { useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useApi } from '../../hooks/useApi';

type Eff = { teamId: number; adjOffEff: number; adjDefEff: number; overallRating: number; tempo: number };
type Team = { id: number; name: string };

export default function EfficiencyRatings() {
  const { state } = useSeasonState();
  const eff = useApi<Eff[]>(`/api/rankings/efficiency/${state.season}/${state.week}`);
  const teams = useApi<Team[]>('/api/teams');
  const teamMap = useMemo(() => new Map((teams.data ?? []).map((t) => [t.id, t.name])), [teams.data]);

  if (eff.loading || teams.loading) return <div>Loading...</div>;
  if (eff.error) return <div>Error: {eff.error}</div>;

  return <div className="card"><h2 className="text-xl font-semibold mb-2">Efficiency Ratings</h2><DataTable headers={['Team', 'AdjOff', 'AdjDef', 'Rating', 'Tempo']} rows={(eff.data ?? []).map((r) => [teamMap.get(r.teamId) ?? r.teamId, r.adjOffEff.toFixed(1), r.adjDefEff.toFixed(1), r.overallRating.toFixed(1), r.tempo.toFixed(1)])} /></div>;
}
