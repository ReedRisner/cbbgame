export default function RangeBar({ min, max }: { min: number; max: number }) {
  return (
    <div className="h-2 bg-slate-700 rounded relative">
      <div className="absolute h-2 bg-orange-500 rounded" style={{ left: `${min}%`, width: `${Math.max(1, max - min)}%` }} />
    </div>
  );
}
