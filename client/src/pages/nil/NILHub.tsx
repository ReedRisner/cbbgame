import BudgetBar from '../../components/BudgetBar';
import { useUserTeam } from '../../context/UserTeamContext';
import { useApi } from '../../hooks/useApi';

type Budget = { budget: number; spending: number; fatigueModifier: number };

export default function NILHub() {
  const { userTeamId } = useUserTeam();
  const budget = useApi<Budget>(`/api/nil/budget/${userTeamId ?? 1}`);
  const contracts = useApi<any[]>(`/api/nil/contracts/${userTeamId ?? 1}`);

  if (budget.loading || contracts.loading) return <div>Loading...</div>;
  if (budget.error) return <div>Error: {budget.error}</div>;

  const total = budget.data?.budget ?? 0;
  const spending = budget.data?.spending ?? 0;
  return (
    <div className="space-y-3">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">NIL Dashboard</h2>
        <p>Total ${total.toLocaleString()} · Committed ${spending.toLocaleString()} · Remaining ${(total - spending).toLocaleString()}</p>
        <div className="mt-2"><BudgetBar committed={spending} total={Math.max(total, 1)} /></div>
      </div>
      <div className="card">
        <p>Active contracts: {(contracts.data ?? []).length}</p>
      </div>
    </div>
  );
}
