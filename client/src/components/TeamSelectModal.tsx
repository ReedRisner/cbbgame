import { useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useUserTeam } from '../context/UserTeamContext';

export default function TeamSelectModal() {
  const { userTeamId, setUserTeamId } = useUserTeam();
  const [query, setQuery] = useState('');
  const teams = useApi<any[]>('/api/teams');

  const filtered = useMemo(() => (teams.data ?? []).filter((t) => t.name.toLowerCase().includes(query.toLowerCase())), [teams.data, query]);

  if (userTeamId) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-xl">
        <h2 className="text-xl font-semibold">Select Your Team</h2>
        <input className="mt-3 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2" placeholder="Search teams..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="max-h-96 overflow-auto mt-3 divide-y divide-slate-700">
          {filtered.map((team) => (
            <button key={team.id} className="w-full text-left p-2 hover:bg-slate-700" onClick={() => setUserTeamId(team.id)}>{team.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
