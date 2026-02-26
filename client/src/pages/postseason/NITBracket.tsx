import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useApi } from '../../hooks/useApi';

type NIT = { teamId: number; seed: number; roundEliminated: string | null };
type Result = { teamId: number; tournament: string; roundEliminated: string | null };
type Team = { id: number; name: string };

export default function NITBracket() {
  const { state } = useSeasonState();
  const nit = useApi<NIT[]>(`/api/postseason/nit/${state.season}`);
  const cbi = useApi<Result[]>(`/api/postseason/cbi/${state.season}`);
  const cit = useApi<Result[]>(`/api/postseason/cit/${state.season}`);
  const teams = useApi<Team[]>('/api/teams');

  if (nit.loading || cbi.loading || cit.loading || teams.loading) return <div>Loading...</div>;
  const teamMap = new Map((teams.data ?? []).map((t) => [t.id, t.name]));

  return (
    <div className="space-y-3">
      <div className="card"><h2 className="text-xl font-semibold mb-2">NIT</h2><DataTable headers={['Team', 'Seed', 'Eliminated']} rows={(nit.data ?? []).map((r) => [teamMap.get(r.teamId) ?? r.teamId, r.seed, r.roundEliminated ?? 'Alive'])} /></div>
      <div className="card"><h2 className="text-xl font-semibold mb-2">CBI</h2><DataTable headers={['Team', 'Eliminated']} rows={(cbi.data ?? []).map((r) => [teamMap.get(r.teamId) ?? r.teamId, r.roundEliminated ?? 'Alive'])} /></div>
      <div className="card"><h2 className="text-xl font-semibold mb-2">CIT</h2><DataTable headers={['Team', 'Eliminated']} rows={(cit.data ?? []).map((r) => [teamMap.get(r.teamId) ?? r.teamId, r.roundEliminated ?? 'Alive'])} /></div>
    </div>
  );
}
