import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/DataTable';

export default function ConferenceDetail() {
  const { id } = useParams();
  const { data, loading } = useApi<any>(`/api/conferences/${id}`);
  if (loading || !data) return <div>Loading conference...</div>;
  return <div className="space-y-4"><div className="card"><h1 className="text-xl font-bold">{data.name}</h1><div>Avg prestige {data.stats.avgPrestige.toFixed(1)}</div></div>
    <div className="card"><DataTable headers={['Team','Prestige']} rows={data.teams.map((t:any)=>[t.name,t.currentPrestige.toFixed(1)])} /></div></div>;
}
