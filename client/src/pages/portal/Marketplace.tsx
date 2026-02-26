import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useApi } from '../../hooks/useApi';

type Entry = { playerId: number; fromTeamId: number; reason: string; marketValue?: number; player?: { firstName: string; lastName: string; position: string; trueOverall: number; eligibilityYears: number } };
type Team = { id: number; name: string };

export default function Marketplace() {
  const { state } = useSeasonState();
  const data = useApi<Entry[]>(`/api/portal/marketplace?season=${state.season}`);
  const teams = useApi<Team[]>('/api/teams');

  if (data.loading || teams.loading) return <div>Loading...</div>;
  if (data.error) return <div>Error: {data.error}</div>;

  const teamMap = new Map((teams.data ?? []).map((t) => [t.id, t.name]));

  return <div className='card'><h2 className='text-xl font-semibold mb-2'>Portal Marketplace</h2><DataTable headers={['Player','Pos','OVR','From','Reason','Value','Eligibility']} rows={(data.data ?? []).map((p) => [<Link key={p.playerId} className='text-cyan-300' to={`/players/${p.playerId}`}>{p.player ? `${p.player.firstName} ${p.player.lastName}` : `Player ${p.playerId}`}</Link>, p.player?.position ?? '-', p.player?.trueOverall ?? '-', teamMap.get(p.fromTeamId) ?? p.fromTeamId, p.reason, p.marketValue ?? '-', p.player?.eligibilityYears ?? '-'])} /></div>;
}
