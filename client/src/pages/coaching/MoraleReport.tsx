import DataTable from '../../components/DataTable';
import { useUserTeam } from '../../context/UserTeamContext';
import { useApi } from '../../hooks/useApi';

type Morale = { id: number; firstName: string; lastName: string; morale: number };

export default function MoraleReport() {
  const { userTeamId } = useUserTeam();
  const data = useApi<Morale[]>(`/api/morale/${userTeamId ?? 1}`);
  if (data.loading) return <div>Loading...</div>;
  if (data.error) return <div>Error: {data.error}</div>;
  return <div className="card"><h2 className="text-xl font-semibold mb-2">Morale Report</h2><DataTable headers={['Player', 'Morale']} rows={(data.data ?? []).map((p) => [`${p.firstName} ${p.lastName}`, Math.round(p.morale)])} /></div>;
}
