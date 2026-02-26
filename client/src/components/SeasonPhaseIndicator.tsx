export default function SeasonPhaseIndicator({ phase }: { phase: string }) {
  return <span className="px-3 py-1 rounded-full bg-slate-700 text-sm">{phase}</span>;
}
