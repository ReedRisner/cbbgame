import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserTeam } from '../context/UserTeamContext';
import ConfirmDialog from './ConfirmDialog';

export default function TopNav() {
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState(false);
  const nav = useNavigate();
  const { setUserTeamId, resetProgress } = useUserTeam();

  const clearTeam = () => {
    resetProgress();
    setUserTeamId(null);
    setConfirm(false);
  };

  return (
    <div className="border-b border-slate-700 p-3 flex justify-between items-center">
      <div className="text-slate-300">Phase 2–4 Frontend</div>
      <div className="flex items-center gap-3">
        <button className="px-2 py-1 rounded bg-slate-700 text-sm" onClick={() => setConfirm(true)}>Change Team</button>
        <form onSubmit={(e) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(q)}`); }}>
          <input className="bg-slate-800 border border-slate-600 rounded px-2 py-1" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </div>
      <ConfirmDialog open={confirm} title="Change your team?" message="This will reset your season progress. Continue?" onCancel={() => setConfirm(false)} onConfirm={clearTeam} />
    </div>
  );
}
