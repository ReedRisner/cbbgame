import { Link } from 'react-router-dom';
import { useSeasonState } from '../../context/SeasonContext';
import { useApi } from '../../hooks/useApi';

type Group = {
  conference: { id: number; name: string; shortName?: string | null };
  standings: Array<{ team?: { name: string }; conferenceWins: number; conferenceLosses: number }>;
};

export default function StandingsHub() {
  const { state } = useSeasonState();
  const data = useApi<Group[]>(`/api/standings/${state.season}`);

  if (data.loading) return <div>Loading...</div>;
  if (data.error) return <div>Error: {data.error}</div>;

  return (
    <div className="card space-y-2">
      <h2 className="text-xl font-semibold">Standings</h2>
      {(data.data ?? []).map((g) => {
        const leader = [...(g.standings ?? [])].sort((a, b) => (b.conferenceWins - b.conferenceLosses) - (a.conferenceWins - a.conferenceLosses))[0];
        return (
          <div key={g.conference.id} className="flex items-center justify-between border-b border-slate-700 py-2">
            <div>
              <p>{g.conference.shortName ?? g.conference.name}</p>
              <p className="text-xs text-slate-400">Leader: {leader?.team?.name ?? '—'} {leader ? `(${leader.conferenceWins}-${leader.conferenceLosses})` : ''}</p>
            </div>
            <Link to={`/standings/${g.conference.id}`} className="text-cyan-300">View</Link>
          </div>
        );
      })}
    </div>
  );
}
