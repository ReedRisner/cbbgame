import { Link } from 'react-router-dom';
import { useSeasonState } from '../../context/SeasonContext';
import { useUserTeam } from '../../context/UserTeamContext';
import { apiRequest, useApi } from '../../hooks/useApi';

type Board = { recruitId: number };

type Recruit = { id: number; starRating: number };

export default function RecruitingHub() {
  const { state } = useSeasonState();
  const { userTeamId } = useUserTeam();
  const teamId = userTeamId ?? 1;
  const board = useApi<Board[]>(`/api/recruiting/board/${teamId}?season=${state.season}`);
  const recruits = useApi<{ data: Recruit[] }>('/api/recruits?page=1&pageSize=500');

  const advance = async () => {
    await apiRequest('/api/recruiting/advance-week', { method: 'POST', body: JSON.stringify({ season: state.season, week: state.week }) });
    window.location.reload();
  };

  if (board.loading || recruits.loading) return <div>Loading...</div>;
  if (board.error) return <div>Error: {board.error}</div>;

  const map = new Map((recruits.data?.data ?? []).map((r) => [r.id, r]));
  const stars = (board.data ?? []).map((b) => map.get(b.recruitId)?.starRating ?? 0).filter(Boolean);
  const avg = stars.length ? (stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-3">
      <div className="card">
        <h2 className="text-xl font-semibold">Recruiting Dashboard</h2>
        <p className="text-slate-300">Season {state.season} · Week {state.week}</p>
      </div>
      <div className="card flex items-center justify-between">
        <div>
          <p>Board size: {(board.data ?? []).length}</p>
          <p>Avg target stars: {avg}</p>
        </div>
        <button className="px-4 py-2 rounded bg-green-700" onClick={advance}>Advance Recruiting Week</button>
      </div>
      <div className="card grid md:grid-cols-3 gap-2">
        <Link className="rounded bg-slate-800 p-3 hover:bg-slate-700" to="/recruiting/board">Your Board</Link>
        <Link className="rounded bg-slate-800 p-3 hover:bg-slate-700" to="/recruiting/national">National Board</Link>
        <Link className="rounded bg-slate-800 p-3 hover:bg-slate-700" to="/recruiting/feed">Commitment Feed</Link>
      </div>
    </div>
  );
}
