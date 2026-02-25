import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import RadarChart from '../components/RadarChart';
import AttributeBar from '../components/AttributeBar';

export default function PlayerDetail() {
  const { id } = useParams();
  const { data, loading } = useApi<any>(`/api/players/${id}`);
  if (loading || !data) return <div>Loading player...</div>;

  return <div className="space-y-4"><div className="card"><h1 className="text-xl">{data.firstName} {data.lastName}</h1><div>{data.team.name} · {data.position} · {data.classYear}</div></div>
  <div className="card"><h2 className="font-semibold">Skills (visible)</h2><RadarChart values={Object.entries(data.skills).map(([label,value])=>({label,value:value as number}))} /></div>
  <div className="card"><h2 className="font-semibold">Tendencies</h2><div className="grid grid-cols-2 gap-2">{Object.entries(data.tendencies).map(([k,v])=><AttributeBar key={k} label={k} value={v as number} />)}</div></div>
  <div className="card"><h2 className="font-semibold">Personality</h2><div className="grid grid-cols-2 gap-2">{Object.entries(data.personality).map(([k,v])=><AttributeBar key={k} label={k} value={v as number} />)}</div>
  <div className="text-sm text-slate-300">Injury: {data.status.injuryLabel} · Consistency: {data.status.consistencyLabel} · NBA Interest: {data.status.nbaInterest ?? 'None'}</div></div>
  </div>;
}
