import { useSeasonState } from '../../context/SeasonContext';
import { useApi } from '../../hooks/useApi';

type Entry = { id: number; status: string; reason: string; player?: { firstName: string; lastName: string; position: string; trueOverall: number } };

export default function ActivityFeed() {
  const { state } = useSeasonState();
  const data = useApi<Entry[]>(`/api/portal/entries/${state.season}`);
  if (data.loading) return <div>Loading...</div>;
  if (data.error) return <div>Error: {data.error}</div>;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Portal Activity Feed</h2>
      <div className="space-y-2 max-h-[70vh] overflow-auto">
        {(data.data ?? []).map((e) => <div key={e.id} className="rounded border border-slate-700 p-2">{e.player ? `${e.player.firstName} ${e.player.lastName}` : 'Player'} ({e.player?.trueOverall ?? '-'} {e.player?.position ?? ''}) · {e.status} · {e.reason}</div>)}
      </div>
    </div>
  );
}
