import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import RangeBar from '../components/RangeBar';
import StarRating from '../components/StarRating';

export default function RecruitDetail() {
  const { id } = useParams();
  const { data, loading } = useApi<any>(`/api/recruits/${id}`);
  if (loading || !data) return <div>Loading recruit...</div>;

  return <div className="space-y-4"><div className="card"><h1 className="text-xl">{data.name}</h1><div>{data.position} · <StarRating stars={data.starRating} /> · {data.hometown}</div></div>
  <div className="card"><h2 className="font-semibold">Scouted Ranges</h2><div className="text-xs mb-2">Overall: {data.scouted.overallRange[0]}-{data.scouted.overallRange[1]}</div><RangeBar min={data.scouted.overallRange[0]} max={data.scouted.overallRange[1]} />
  <div className="space-y-2 mt-3">{data.scouted.attributes.map((a:any)=><div key={a.key}><div className="text-xs">{a.key}: {a.range[0]}-{a.range[1]}</div><RangeBar min={a.range[0]} max={a.range[1]} /></div>)}</div></div>
  </div>;
}
