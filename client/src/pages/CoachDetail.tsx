import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import AttributeBar from '../components/AttributeBar';
import SchemeSliders from '../components/SchemeSliders';

export default function CoachDetail() {
  const { id } = useParams();
  const { data, loading } = useApi<any>(`/api/coaches/${id}`);
  if (loading || !data) return <div>Loading coach...</div>;
  const attrs = ['overall','offense','defense','recruiting','development','discipline','adaptability','analytics','charisma','programBuilding','gameManagement'];

  return <div className="space-y-4"><div className="card"><h1 className="text-xl">{data.firstName} {data.lastName}</h1><div>{data.team.name} · {data.role}</div></div>
  <div className="card grid grid-cols-2 gap-2">{attrs.map((k)=><AttributeBar key={k} label={k} value={data[k]} />)}</div>
  <div className="card"><h2 className="font-semibold">Scheme</h2><SchemeSliders coach={data} /></div>
  <div className="card">Contract: ${data.salary.toLocaleString()} · {data.contractYears} years</div>
  </div>;
}
