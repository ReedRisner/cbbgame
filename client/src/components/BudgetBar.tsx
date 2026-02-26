export default function BudgetBar({ committed, total }: { committed: number; total: number }) {
  const pct = Math.min(100, Math.round((committed / Math.max(1, total)) * 100));
  return <div className="w-full bg-slate-700 h-3 rounded"><div className="bg-sky-500 h-3 rounded" style={{ width: `${pct}%` }} /></div>;
}
