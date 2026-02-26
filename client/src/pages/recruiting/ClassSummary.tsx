import DataTable from '../../components/DataTable';
import { useSeasonState } from '../../context/SeasonContext';
import { useUserTeam } from '../../context/UserTeamContext';
import { useApi } from '../../hooks/useApi';

type Recruit = { id: number; firstName: string; lastName: string; position: string; starRating: number; signedTeamId: number | null; hometown: string; state: string };

export default function ClassSummary() {
  const { state } = useSeasonState();
  const { userTeamId } = useUserTeam();
  const teamId = userTeamId ?? 1;
  const recruits = useApi<{ data: Recruit[] }>('/api/recruits?page=1&pageSize=1000');

  if (recruits.loading) return <div>Loading...</div>;
  if (recruits.error) return <div>Error: {recruits.error}</div>;

  const classList = (recruits.data?.data ?? []).filter((r) => r.signedTeamId === teamId);
  const avg = classList.length ? (classList.reduce((s, r) => s + r.starRating, 0) / classList.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-3">
      <div className="card"><h2 className="text-xl font-semibold">Class Summary</h2><p className="text-slate-300">Season {state.season} · Commits: {classList.length} · Avg Stars: {avg}</p></div>
      <div className="card"><DataTable headers={['Name', 'Pos', 'Stars', 'Hometown']} rows={classList.map((r) => [`${r.firstName} ${r.lastName}`, r.position, r.starRating, `${r.hometown}, ${r.state}`])} /></div>
    </div>
  );
}
