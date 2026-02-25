import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import AttributeBar from '../components/AttributeBar';
import DataTable from '../components/DataTable';
import SchemeSliders from '../components/SchemeSliders';

export default function TeamDetail() {
  const { id } = useParams();
  const { data: team, loading } = useApi<any>(`/api/teams/${id}`);
  if (loading || !team) return <div>Loading team...</div>;

  return <div className="space-y-4">
    <div className="card"><h1 className="text-xl font-bold">{team.name} {team.mascot}</h1><div>{team.conference.name} · {team.conference.tier}</div></div>
    <div className="card grid grid-cols-2 gap-3">
      {[['Current Prestige',team.currentPrestige],['Historical Prestige',team.historicalPrestige],['Facility',team.facilityRating],['NIL',team.nilCollectiveStrength],['Booster',team.boosterBudget],['Media',team.mediaMarket],['Fan',team.fanIntensity],['Academic',team.academicRating]].map(([l,v]) => <AttributeBar key={String(l)} label={String(l)} value={Number(v)} />)}
    </div>
    <div className="card"><h2 className="font-semibold">Roster</h2><DataTable headers={['Name','Pos','Class','OVR']} rows={team.players.map((p:any)=>[`${p.firstName} ${p.lastName}`,p.position,p.classYear,p.trueOverall.toFixed(1)])} /></div>
    <div className="card"><h2 className="font-semibold">Coaching Staff</h2>{team.coaches.map((c:any)=><div key={c.id} className="mb-4"><div className="font-medium">{c.firstName} {c.lastName} ({c.role})</div><SchemeSliders coach={c} /></div>)}</div>
    <div className="card"><h2 className="font-semibold">Rivals</h2><pre className="text-xs">{JSON.stringify(team.rivalries, null, 2)}</pre></div>
  </div>;
}
