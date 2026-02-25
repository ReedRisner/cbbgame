import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TierBadge from '../components/TierBadge';
import { useApi } from '../hooks/useApi';
import { TeamSummary } from '../types';

export default function TeamsList() {
  const { data, loading, error } = useApi<TeamSummary[]>('/api/teams');
  if (loading) return <div>Loading teams...</div>;
  if (error || !data) return <div>Failed to load teams.</div>;

  return <div className="card"><DataTable headers={['Name','Conference','Tier','Prestige']} rows={data.map(t=>[
    <Link to={`/teams/${t.id}`} className='text-cyan-300'>{t.name}</Link>, t.conference, <TierBadge tier={t.tier} />, t.prestige.toFixed(1)
  ])} /></div>;
}
