import DataTable from '../../components/DataTable';
import { useUserTeam } from '../../context/UserTeamContext';
import { useApi } from '../../hooks/useApi';

type Fit = { id: number; firstName: string; lastName: string; fitScore: number };

export default function FitReport() {
  const { userTeamId } = useUserTeam();
  const data = useApi<Fit[]>(`/api/playstyle/fit/${userTeamId ?? 1}`);
  if (data.loading) return <div>Loading...</div>;
  if (data.error) return <div>Error: {data.error}</div>;
  return <div className="card"><h2 className="text-xl font-semibold mb-2">Scheme Fit Report</h2><DataTable headers={['Player', 'Fit']} rows={(data.data ?? []).map((p) => [`${p.firstName} ${p.lastName}`, p.fitScore.toFixed(1)])} /></div>;
}
