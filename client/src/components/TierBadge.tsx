import { Tier } from '../types';

const styles: Record<Tier, string> = {
  POWER4: 'bg-blue-700',
  UPPER_MID: 'bg-cyan-700',
  MID: 'bg-emerald-700',
  LOW_MAJOR: 'bg-slate-600'
};

export default function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`px-2 py-1 rounded text-xs ${styles[tier]}`}>{tier.replace('_', ' ')}</span>;
}
