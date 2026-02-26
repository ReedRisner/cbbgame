import { useMemo, useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';
import SchemeSliders from '../../components/SchemeSliders';
import { useUserTeam } from '../../context/UserTeamContext';
import { apiRequest, useApi } from '../../hooks/useApi';

type Coach = {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  age: number;
  recruiting: number;
  development: number;
  offense: number;
  defense: number;
  pace: number;
  spacing: number;
  pressureDefense: number;
  crashBoards: number;
  transitionFocus: number;
  pickAndRollUsage: number;
  zoneRate: number;
  benchDepthTrust: number;
};

export default function YourStaff() {
  const { userTeamId } = useUserTeam();
  const teamId = userTeamId ?? 1;
  const team = useApi<{ coaches: Coach[] }>(`/api/teams/${teamId}`);
  const playstyle = useApi<{ coach: Coach }>(`/api/playstyle/${teamId}`);
  const [draft, setDraft] = useState<Record<string, number> | null>(null);
  const [confirm, setConfirm] = useState(false);

  const head = useMemo(() => playstyle.data?.coach ?? team.data?.coaches?.find((c) => c.role === 'HEAD') ?? null, [team.data, playstyle.data]);
  const assistants = (team.data?.coaches ?? []).filter((c) => c.role !== 'HEAD');

  if (team.loading || playstyle.loading) return <div>Loading...</div>;
  if (team.error || playstyle.error) return <div>Error: {team.error ?? playstyle.error}</div>;
  if (!head) return <div className="card">No staff data.</div>;

  const view = draft ? { ...head, ...draft } : head;
  const keys = ['pace', 'spacing', 'pressureDefense', 'crashBoards', 'transitionFocus', 'pickAndRollUsage', 'zoneRate', 'benchDepthTrust'] as const;

  const save = async () => {
    if (!draft) return;
    setConfirm(false);
    await apiRequest(`/api/playstyle/${teamId}`, { method: 'PUT', body: JSON.stringify(draft) });
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-semibold">Head Coach</h2>
        <p>{view.firstName} {view.lastName} (Age {view.age})</p>
        <p className="text-sm text-slate-300">Off {Math.round(view.offense)} · Def {Math.round(view.defense)} · Rec {Math.round(view.recruiting)} · Dev {Math.round(view.development)}</p>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Assistants</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {assistants.map((a) => <div key={a.id} className="rounded border border-slate-700 p-2">{a.firstName} {a.lastName} · {a.role}</div>)}
        </div>
      </div>
      <div className="card"><h3 className="font-semibold mb-2">Current Scheme</h3><SchemeSliders coach={view} /></div>
      <div className="card space-y-2">
        <h3 className="font-semibold">Edit Scheme</h3>
        {keys.map((k) => (
          <label key={k} className="block text-sm">
            <div>{k}</div>
            <input className="w-full" type="range" min={0} max={100} value={draft?.[k] ?? view[k]} onChange={(e) => setDraft({ ...(draft ?? {}), [k]: Number(e.target.value) })} />
          </label>
        ))}
        <button className="px-4 py-2 rounded bg-blue-700" onClick={() => setConfirm(true)} disabled={!draft}>Apply changes</button>
      </div>
      <ConfirmDialog open={confirm} title="Change scheme sliders?" message="This may affect player morale and fit scores. Apply changes?" onCancel={() => setConfirm(false)} onConfirm={save} />
    </div>
  );
}
