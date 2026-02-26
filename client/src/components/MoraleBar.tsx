export default function MoraleBar({ value }: { value: number }) {
  const color = value < 30 ? 'bg-red-600' : value < 50 ? 'bg-orange-500' : value < 70 ? 'bg-slate-400' : value < 85 ? 'bg-green-500' : 'bg-blue-500';
  return <div className="w-full bg-slate-700 h-3 rounded"><div className={`${color} h-3 rounded`} style={{ width: `${value}%` }} /></div>;
}
