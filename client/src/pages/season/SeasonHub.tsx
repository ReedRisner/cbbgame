import { useState } from 'react';
import SeasonPhaseIndicator from '../../components/SeasonPhaseIndicator';
import WeekAdvanceButton from '../../components/WeekAdvanceButton';
import { useSeasonState } from '../../context/SeasonContext';
import { useToasts } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function SeasonHub() {
  const { state, setState } = useSeasonState();
  const { pushToast } = useToasts();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const advanceWeek = async () => {
    setLoading(true);
    try {
      await fetch('/api/season/advance-week', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ season: state.season, week: state.week }) });
      const week = state.week + 1;
      setState({ ...state, week, phase: week < 10 ? 'Non-Conference' : week < 20 ? 'Conference Play' : 'Postseason' });
      pushToast({ type: 'success', message: 'Week advanced. Rankings, recruiting, and games updated.' });
    } finally { setLoading(false); }
  };

  const runFull = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      await fetch('/api/season/run-full', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ season: state.season }) });
      pushToast({ type: 'info', message: 'Full season simulation completed.' });
    } finally { setLoading(false); }
  };

  return <div className="space-y-4">
    <div className="card flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">Season {state.season} — Week {state.week}</h2>
        <p className="text-slate-300 mt-1">Phase: <SeasonPhaseIndicator phase={state.phase} /></p>
      </div>
      <div className="flex gap-2">
        <WeekAdvanceButton loading={loading} onClick={advanceWeek} />
        <button className="px-4 py-2 rounded bg-slate-700" onClick={() => setState({ ...state, week: Math.min(36, state.week + 4) })}>Sim to Date</button>
        <button className="px-4 py-2 rounded bg-rose-700" onClick={() => setConfirm(true)}>Run Full Season</button>
      </div>
    </div>
    <div className="card"><h3 className="font-semibold mb-2">Week Summary</h3><p className="text-slate-300">Advance the week to view your game result, upsets, ranking changes, commitments, portal and coaching activity.</p></div>
    <ConfirmDialog open={confirm} title="Run full season?" message="This will simulate all remaining weeks. Continue?" onCancel={() => setConfirm(false)} onConfirm={runFull} />
  </div>;
}
