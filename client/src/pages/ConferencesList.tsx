import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { ConferenceSummary } from '../types';
import DataTable from '../components/DataTable';

export default function ConferencesList() {
  const { data, loading } = useApi<ConferenceSummary[]>('/api/conferences');
  if (loading || !data) return <div>Loading conferences...</div>;
  return <div className="card"><DataTable headers={['Conference','Tier','Prestige','Members']} rows={data.map(c=>[
    <Link to={`/conferences/${c.id}`} className='text-cyan-300'>{c.name}</Link>, c.tier, c.prestige.toFixed(1), c.memberCount
  ])} /></div>;
}
