export default function InterestBar({ value }: { value: number }) {
  const color = value > 70 ? 'bg-emerald-500' : value > 40 ? 'bg-amber-500' : 'bg-rose-500';
  return <div className="w-full bg-slate-700 rounded h-3"><div className={`h-3 rounded ${color}`} style={{ width: `${value}%` }} /></div>;
}
