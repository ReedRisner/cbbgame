import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { data, loading } = useApi<any>(`/api/search?q=${encodeURIComponent(q)}`);
  if (loading) return <div>Searching...</div>;

  return <div className="space-y-4">
    <div className="card"><h2 className="font-semibold">Teams</h2>{data?.teams?.map((t:any)=><div key={t.id}><Link to={`/teams/${t.id}`} className='text-cyan-300'>{t.name}</Link></div>)}</div>
    <div className="card"><h2 className="font-semibold">Players</h2>{data?.players?.map((p:any)=><div key={p.id}><Link to={`/players/${p.id}`} className='text-cyan-300'>{p.name}</Link></div>)}</div>
    <div className="card"><h2 className="font-semibold">Coaches</h2>{data?.coaches?.map((c:any)=><div key={c.id}><Link to={`/coaches/${c.id}`} className='text-cyan-300'>{c.name}</Link></div>)}</div>
  </div>;
}
