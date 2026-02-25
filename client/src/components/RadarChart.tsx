export default function RadarChart({ values }: { values: { label: string; value: number }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {values.map((v) => (
        <div key={v.label} className="text-xs">
          <div className="flex justify-between"><span>{v.label}</span><span>{Math.round(v.value)}</span></div>
          <div className="h-1 bg-slate-700 rounded"><div className="h-1 bg-cyan-500 rounded" style={{ width: `${v.value}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
