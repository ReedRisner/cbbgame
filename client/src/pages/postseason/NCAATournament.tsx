import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useState } from 'react';
import { useSeasonState } from '../../context/SeasonContext';
import { apiRequest, useApi } from '../../hooks/useApi';

type Row = { teamId: number; seed: number; region: string; roundEliminated: string | null };
type Team = { id: number; name: string };

const ROUNDS = ['R64', 'R32', 'S16', 'E8', 'F4', 'CG'] as const;

export default function NCAATournament() {
  const { state } = useSeasonState();
  const rows = useApi<Row[]>(`/api/postseason/ncaa/${state.season}`);
  const teams = useApi<Team[]>('/api/teams');
  const [confirm, setConfirm] = useState(false);

  const simRound = async (round: string) => {
    await apiRequest('/api/postseason/simulate-ncaa-round', { method: 'POST', body: JSON.stringify({ season: state.season, round }) });
    window.location.reload();
  };

  const simAll = async () => {
    setConfirm(false);
    await apiRequest('/api/postseason/simulate-full', { method: 'POST', body: JSON.stringify({ season: state.season }) });
    window.location.reload();
  };

  if (rows.loading || teams.loading) return <div>Loading...</div>;
  if (rows.error) return <div>Error: {rows.error}</div>;

  const teamMap = new Map((teams.data ?? []).map((t) => [t.id, t.name]));

  return (
    <div className="space-y-3">
      <div className="card flex flex-wrap gap-2">
        {ROUNDS.map((r) => <button key={r} className="px-3 py-2 rounded bg-amber-700" onClick={() => simRound(r)}>Sim {r}</button>)}
        <button className="px-3 py-2 rounded bg-rose-700" onClick={() => setConfirm(true)}>Sim Entire Tournament</button>
      </div>
      <div className="card"><h2 className="text-xl font-semibold mb-2">NCAA Tournament</h2><DataTable headers={['Team', 'Seed', 'Region', 'Eliminated']} rows={(rows.data ?? []).map((r) => [teamMap.get(r.teamId) ?? r.teamId, r.seed, r.region, r.roundEliminated ?? 'Alive'])} /></div>
      <ConfirmDialog open={confirm} title="Simulate entire NCAA tournament?" message="This will simulate all remaining rounds." onCancel={() => setConfirm(false)} onConfirm={simAll} />
    </div>
  );
}
