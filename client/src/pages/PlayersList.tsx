import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Paginated, PlayerSummary } from '../types';
import DataTable from '../components/DataTable';

export default function PlayersList() {
  const { data, loading } = useApi<Paginated<PlayerSummary>>('/api/players?page=1&pageSize=50');
  if (loading || !data) return <div>Loading players...</div>;
  return <div className="card"><DataTable headers={['Name','Team','Pos','Class','OVR']} rows={data.data.map((p)=>[
    <Link to={`/players/${p.id}`} className='text-cyan-300'>{p.name}</Link>, p.team, p.position, p.classYear, p.overall.toFixed(1)
  ])} /></div>;
}
