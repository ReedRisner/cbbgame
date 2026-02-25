import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Paginated, RecruitSummary } from '../types';
import DataTable from '../components/DataTable';
import StarRating from '../components/StarRating';

export default function RecruitBoard() {
  const { data, loading } = useApi<Paginated<RecruitSummary>>('/api/recruits?page=1&pageSize=50');
  if (loading || !data) return <div>Loading recruits...</div>;
  return <div className="card"><DataTable headers={['Name','Pos','Stars','State','OVR Range','POT Range']} rows={data.data.map((r)=>[
    <Link to={`/recruits/${r.id}`} className='text-cyan-300'>{r.name}</Link>, r.position, <StarRating stars={r.starRating} />, r.state,
    `${r.scoutedOverallRange[0]}-${r.scoutedOverallRange[1]}`,
    `${r.scoutedPotentialRange[0]}-${r.scoutedPotentialRange[1]}`
  ])} /></div>;
}
