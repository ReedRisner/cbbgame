import { useMemo } from 'react';
import { useSeasonState } from '../../context/SeasonContext';
import { useApi } from '../../hooks/useApi';

type Recruit = { id: number; firstName: string; lastName: string; starRating: number; signedTeamId: number | null; createdAt?: string };
type Team = { id: number; name: string };

export default function CommitmentFeed() {
  const { state } = useSeasonState();
  const recruits = useApi<{ data: Recruit[] }>(`/api/recruits?page=1&pageSize=1000`);
  const teams = useApi<Team[]>('/api/teams');

  const teamMap = useMemo(() => new Map((teams.data ?? []).map((t) => [t.id, t.name])), [teams.data]);
  if (recruits.loading || teams.loading) return <div>Loading...</div>;
  if (recruits.error) return <div>Error: {recruits.error}</div>;

  const committed = (recruits.data?.data ?? []).filter((r) => r.signedTeamId != null).sort((a, b) => b.starRating - a.starRating);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-3">Commitment Feed (Season {state.season})</h2>
      <div className="space-y-2 max-h-[65vh] overflow-auto">
        {committed.map((r) => <div key={r.id} className="rounded border border-slate-700 p-2">{'⭐'.repeat(r.starRating)} {r.firstName} {r.lastName} commits to {teamMap.get(r.signedTeamId!) ?? `Team ${r.signedTeamId}`}</div>)}
        {committed.length === 0 && <p className="text-slate-400">No commitments yet.</p>}
      </div>
    </div>
  );
}
