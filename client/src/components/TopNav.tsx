import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  return (
    <div className="border-b border-slate-700 p-3 flex justify-between items-center">
      <div className="text-slate-300">Phase 1 Universe Browser</div>
      <form onSubmit={(e) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(q)}`); }}>
        <input className="bg-slate-800 border border-slate-600 rounded px-2 py-1" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
    </div>
  );
}
