import { useSeasonState } from '../../context/SeasonContext';
import { apiRequest, useApi } from '../../hooks/useApi';

type Entry = { id: number; status: string; player?: { trueOverall: number } };

export default function PortalHub() {
  const { state } = useSeasonState();
  const all = useApi<Entry[]>(`/api/portal/entries/${state.season}`);
  const market = useApi<Entry[]>(`/api/portal/marketplace?season=${state.season}`);

  const advance = async () => {
    await apiRequest('/api/portal/advance', { method: 'POST', body: JSON.stringify({ season: state.season }) });
    window.location.reload();
  };

  if (all.loading || market.loading) return <div>Loading...</div>;
  if (all.error) return <div>Error: {all.error}</div>;

  const entries = all.data ?? [];
  const avg = entries.length ? Math.round(entries.reduce((s, e) => s + (e.player?.trueOverall ?? 0), 0) / entries.length) : 0;
  return (
    <div className="space-y-3">
      <div className="card"><h2 className="text-xl font-semibold">Transfer Portal Dashboard</h2><p>Total {entries.length} · Avg OVR {avg} · Committed {entries.filter((e) => e.status === 'COMMITTED').length} · Remaining {(market.data ?? []).length}</p></div>
      <div className="card"><button className="px-4 py-2 rounded bg-amber-700" onClick={advance}>Advance Portal</button></div>
    </div>
  );
}
