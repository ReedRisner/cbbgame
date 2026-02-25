import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { TeamSummary, PlayerSummary } from '../types';
import DataTable from '../components/DataTable';

export default function Dashboard() {
  const teams = useApi<TeamSummary[]>('/api/teams?sortBy=currentPrestige&order=desc');
  const players = useApi<any>('/api/players?page=1&pageSize=10');

  if (teams.loading || players.loading) return <div>Loading dashboard...</div>;
  if (teams.error || players.error) return <div>Error loading dashboard.</div>;

  const topTeams = (teams.data ?? []).slice(0, 10);
  const topPlayers = (players.data?.data ?? []) as PlayerSummary[];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="card">Teams: {teams.data?.length}</div>
        <div className="card">Players: {players.data?.total ?? '-'}</div>
        <div className="card">Conferences: 32</div>
        <div className="card">Mode: Browse-only</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card"><h2 className="font-semibold mb-2">Top 10 Teams by Prestige</h2><DataTable headers={['Team','Prestige']} rows={topTeams.map(t=>[<Link to={`/teams/${t.id}`} className="text-cyan-300">{t.name}</Link>, t.prestige.toFixed(1)])} /></div>
        <div className="card"><h2 className="font-semibold mb-2">Top 10 Players by Overall</h2><DataTable headers={['Player','OVR']} rows={topPlayers.map(p=>[<Link to={`/players/${p.id}`} className="text-cyan-300">{p.name}</Link>, p.overall.toFixed(1)])} /></div>
      </div>
    </div>
  );
}
