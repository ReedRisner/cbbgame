import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Paginated, CoachSummary } from '../types';
import DataTable from '../components/DataTable';

export default function CoachesList() {
  const { data, loading } = useApi<Paginated<CoachSummary>>('/api/coaches?page=1&pageSize=50');
  if (loading || !data) return <div>Loading coaches...</div>;
  return <div className="card"><DataTable headers={['Name','Role','Team','Overall']} rows={data.data.map((c)=>[
    <Link to={`/coaches/${c.id}`} className='text-cyan-300'>{c.name}</Link>, c.role, c.team, c.overall.toFixed(1)
  ])} /></div>;
}
