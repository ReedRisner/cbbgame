export default function AttributeBar({ label, value }: { label: string; value: number }) {
  const color = value < 30 ? 'bg-red-500' : value < 60 ? 'bg-yellow-500' : value < 80 ? 'bg-green-500' : 'bg-blue-500';
  return (
    <div>
      <div className="flex justify-between text-xs"><span>{label}</span><span>{Math.round(value)}</span></div>
      <div className="h-2 bg-slate-700 rounded"><div className={`${color} h-2 rounded`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
    </div>
  );
}
