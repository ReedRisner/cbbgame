import { useMemo, useState } from 'react';
import { apiRequest } from '../hooks/useApi';

type Phase = 1 | 2 | 3 | 4;
type Status = 'idle' | 'running' | 'pass' | 'fail';

type SharedCtx = {
  teamId: number | null;
  opponentTeamId: number | null;
  season: number;
  week: number;
};

type TestRun = {
  ok: boolean;
  detail: string;
  patch?: Partial<SharedCtx>;
};

type TestDef = {
  id: string;
  phase: Phase;
  name: string;
  run: (ctx: SharedCtx) => Promise<TestRun>;
};

type TestState = {
  status: Status;
  detail: string;
};

type TeamRow = { id: number; name: string };
type Paginated<T> = { data: T[]; total: number };

type PlaystylePayload = {
  coach?: { id?: number };
  effectiveRatings?: Record<string, unknown>;
};

function statusClass(status: Status): string {
  if (status === 'pass') return 'text-emerald-300';
  if (status === 'fail') return 'text-rose-300';
  if (status === 'running') return 'text-amber-300';
  return 'text-slate-300';
}

function requireTeamIds(ctx: SharedCtx): { teamId: number; opponentTeamId: number } | null {
  if (ctx.teamId === null || ctx.opponentTeamId === null) return null;
  return { teamId: ctx.teamId, opponentTeamId: ctx.opponentTeamId };
}

const testDefs: TestDef[] = [
  {
    id: 'p1-health',
    phase: 1,
    name: 'API health',
    run: async () => {
      const data = await apiRequest<{ ok: boolean }>('/api/health');
      return { ok: data.ok === true, detail: data.ok ? 'Health check OK' : 'Health endpoint returned false' };
    }
  },
  {
    id: 'p1-teams',
    phase: 1,
    name: 'Teams listing',
    run: async () => {
      const teams = await apiRequest<TeamRow[]>('/api/teams?sortBy=currentPrestige&order=desc');
      if (teams.length < 2) return { ok: false, detail: `Expected >=2 teams, got ${teams.length}` };
      return {
        ok: true,
        detail: `Loaded ${teams.length} teams`,
        patch: { teamId: teams[0].id, opponentTeamId: teams[1].id }
      };
    }
  },
  {
    id: 'p1-players',
    phase: 1,
    name: 'Players listing',
    run: async () => {
      const players = await apiRequest<Paginated<{ id: number }>>('/api/players?page=1&pageSize=25');
      return {
        ok: players.total > 0 && players.data.length > 0,
        detail: `Total players ${players.total}`
      };
    }
  },
  {
    id: 'p1-coaches',
    phase: 1,
    name: 'Coaches listing',
    run: async () => {
      const coaches = await apiRequest<Paginated<{ id: number }>>('/api/coaches?page=1&pageSize=25');
      return {
        ok: coaches.total > 0 && coaches.data.length > 0,
        detail: `Total coaches ${coaches.total}`
      };
    }
  },
  {
    id: 'p1-conferences',
    phase: 1,
    name: 'Conferences listing',
    run: async () => {
      const conferences = await apiRequest<unknown[]>('/api/conferences');
      return {
        ok: conferences.length > 0,
        detail: `Loaded ${conferences.length} conferences`
      };
    }
  },

  {
    id: 'p2-recruits',
    phase: 2,
    name: 'Recruits board',
    run: async () => {
      const recruits = await apiRequest<Paginated<{ id: number }>>('/api/recruits?page=1&pageSize=25');
      return { ok: recruits.total > 0, detail: `Total recruits ${recruits.total}` };
    }
  },
  {
    id: 'p2-recruiting-board',
    phase: 2,
    name: 'Recruiting board API',
    run: async (ctx) => {
      if (ctx.teamId === null) return { ok: false, detail: 'Missing team id. Run Phase 1 tests first.' };
      const board = await apiRequest<unknown[]>(`/api/recruiting/board/${ctx.teamId}?season=1`);
      return { ok: Array.isArray(board), detail: `Board rows ${board.length}` };
    }
  },
  {
    id: 'p2-portal-market',
    phase: 2,
    name: 'Portal marketplace',
    run: async () => {
      const market = await apiRequest<unknown[]>('/api/portal/marketplace?season=1');
      return { ok: Array.isArray(market), detail: `Portal entries ${market.length}` };
    }
  },
  {
    id: 'p2-nil-budget',
    phase: 2,
    name: 'NIL budget',
    run: async (ctx) => {
      if (ctx.teamId === null) return { ok: false, detail: 'Missing team id. Run Phase 1 tests first.' };
      const data = await apiRequest<{ budget: number; spending: number }>(`/api/nil/budget/${ctx.teamId}`);
      return {
        ok: Number.isFinite(data.budget) && Number.isFinite(data.spending),
        detail: `Budget ${Math.round(data.budget).toLocaleString()} | Spending ${Math.round(data.spending).toLocaleString()}`
      };
    }
  },

  {
    id: 'p3-playstyle',
    phase: 3,
    name: 'Playstyle + effective ratings',
    run: async (ctx) => {
      if (ctx.teamId === null) return { ok: false, detail: 'Missing team id. Run Phase 1 tests first.' };
      const data = await apiRequest<PlaystylePayload>(`/api/playstyle/${ctx.teamId}`);
      const ok = Boolean(data.coach?.id) && Boolean(data.effectiveRatings);
      return { ok, detail: ok ? `Coach ${data.coach?.id} playstyle loaded` : 'Missing coach or ratings payload' };
    }
  },
  {
    id: 'p3-fit',
    phase: 3,
    name: 'Fit report',
    run: async (ctx) => {
      if (ctx.teamId === null) return { ok: false, detail: 'Missing team id. Run Phase 1 tests first.' };
      const data = await apiRequest<Array<{ id: number; fitScore: number }>>(`/api/playstyle/fit/${ctx.teamId}`);
      return { ok: data.length > 0, detail: `Fit rows ${data.length}` };
    }
  },
  {
    id: 'p3-morale',
    phase: 3,
    name: 'Morale report',
    run: async (ctx) => {
      if (ctx.teamId === null) return { ok: false, detail: 'Missing team id. Run Phase 1 tests first.' };
      const data = await apiRequest<Array<{ id: number; morale: number }>>(`/api/morale/${ctx.teamId}`);
      return { ok: data.length > 0, detail: `Morale rows ${data.length}` };
    }
  },
  {
    id: 'p3-game-sim',
    phase: 3,
    name: 'Single game simulation',
    run: async (ctx) => {
      const ids = requireTeamIds(ctx);
      if (!ids) return { ok: false, detail: 'Missing team ids. Run Phase 1 tests first.' };
      const data = await apiRequest<{ homeScore?: number; awayScore?: number; boxScore?: unknown[] }>('/api/game/simulate', {
        method: 'POST',
        body: JSON.stringify({ homeTeamId: ids.teamId, awayTeamId: ids.opponentTeamId })
      });
      const ok = Number.isFinite(data.homeScore) && Number.isFinite(data.awayScore);
      return { ok, detail: ok ? `Sim score ${data.homeScore}-${data.awayScore}` : 'Game simulation payload missing score' };
    }
  },

  {
    id: 'p4-schedule',
    phase: 4,
    name: 'Schedule snapshot',
    run: async (ctx) => {
      const rows = await apiRequest<unknown[]>(`/api/schedule/${ctx.season}`);
      return { ok: rows.length > 0, detail: `Season ${ctx.season} schedule rows ${rows.length}` };
    }
  },
  {
    id: 'p4-standings',
    phase: 4,
    name: 'Conference standings snapshot',
    run: async (ctx) => {
      const rows = await apiRequest<unknown[]>(`/api/standings/${ctx.season}`);
      return { ok: rows.length > 0, detail: `Standings groups ${rows.length}` };
    }
  },
  {
    id: 'p4-rankings-ap',
    phase: 4,
    name: 'AP Top 25 snapshot',
    run: async (ctx) => {
      const rows = await apiRequest<unknown[]>(`/api/rankings/ap/${ctx.season}/${ctx.week}`);
      return { ok: rows.length > 0, detail: `AP rows week ${ctx.week}: ${rows.length}` };
    }
  },
  {
    id: 'p4-postseason',
    phase: 4,
    name: 'NCAA bracket snapshot',
    run: async (ctx) => {
      const rows = await apiRequest<unknown[]>(`/api/postseason/ncaa/${ctx.season}`);
      return { ok: rows.length > 0, detail: `NCAA entries ${rows.length}` };
    }
  }
];

export default function PhaseTests() {
  const [ctx, setCtx] = useState<SharedCtx>({ teamId: null, opponentTeamId: null, season: 2026, week: 15 });
  const [running, setRunning] = useState(false);
  const [states, setStates] = useState<Record<string, TestState>>({});

  const grouped = useMemo(() => {
    return {
      1: testDefs.filter((t) => t.phase === 1),
      2: testDefs.filter((t) => t.phase === 2),
      3: testDefs.filter((t) => t.phase === 3),
      4: testDefs.filter((t) => t.phase === 4)
    } as Record<Phase, TestDef[]>;
  }, []);

  const totals = useMemo(() => {
    const values = Object.values(states);
    const pass = values.filter((v) => v.status === 'pass').length;
    const fail = values.filter((v) => v.status === 'fail').length;
    return { pass, fail, total: testDefs.length };
  }, [states]);

  const runTest = async (test: TestDef): Promise<void> => {
    setStates((prev) => ({ ...prev, [test.id]: { status: 'running', detail: 'Running...' } }));
    try {
      const result = await test.run(ctx);
      if (result.patch) setCtx((prev) => ({ ...prev, ...result.patch }));
      setStates((prev) => ({ ...prev, [test.id]: { status: result.ok ? 'pass' : 'fail', detail: result.detail } }));
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error';
      setStates((prev) => ({ ...prev, [test.id]: { status: 'fail', detail } }));
    }
  };

  const runPhase = async (phase: Phase): Promise<void> => {
    setRunning(true);
    for (const test of grouped[phase]) {
      // eslint-disable-next-line no-await-in-loop
      await runTest(test);
    }
    setRunning(false);
  };

  const runAll = async (): Promise<void> => {
    setRunning(true);
    for (const phase of [1, 2, 3, 4] as Phase[]) {
      for (const test of grouped[phase]) {
        // eslint-disable-next-line no-await-in-loop
        await runTest(test);
      }
    }
    setRunning(false);
  };

  const buildPhase4Data = async (): Promise<void> => {
    setRunning(true);
    try {
      await apiRequest('/api/schedule/generate', { method: 'POST', body: JSON.stringify({ season: ctx.season }) });
      await apiRequest('/api/season/run-full', { method: 'POST', body: JSON.stringify({ season: ctx.season }) });
      await apiRequest('/api/postseason/simulate-full', { method: 'POST', body: JSON.stringify({ season: ctx.season }) });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="font-semibold text-lg">Phase 1-4 Test Console</h2>
        <p className="text-slate-300 text-sm">Runs frontend-triggered API checks for all game phases and reports pass/fail per capability.</p>
        <div className="flex flex-wrap gap-2 items-center">
          <button className="px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50" onClick={runAll} disabled={running}>Run All Phases</button>
          <button className="px-3 py-2 rounded bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50" onClick={buildPhase4Data} disabled={running}>Build Phase 4 Data</button>
          <span className="text-sm">Pass {totals.pass}/{totals.total}</span>
          <span className="text-sm">Fail {totals.fail}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span>Season</span>
            <input
              className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1"
              type="number"
              value={ctx.season}
              onChange={(e) => setCtx((prev) => ({ ...prev, season: Number(e.target.value) || prev.season }))}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Week</span>
            <input
              className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1"
              type="number"
              value={ctx.week}
              onChange={(e) => setCtx((prev) => ({ ...prev, week: Number(e.target.value) || prev.week }))}
            />
          </label>
          <div className="text-slate-300">Team ID: {ctx.teamId ?? 'auto'}</div>
          <div className="text-slate-300">Opponent ID: {ctx.opponentTeamId ?? 'auto'}</div>
        </div>
      </div>

      {[1, 2, 3, 4].map((phaseNum) => {
        const phase = phaseNum as Phase;
        return (
          <div key={phase} className="card space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Phase {phase}</h3>
              <button className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50" onClick={() => runPhase(phase)} disabled={running}>
                Run Phase {phase}
              </button>
            </div>
            <div className="space-y-2">
              {grouped[phase].map((test) => {
                const state = states[test.id] ?? { status: 'idle', detail: 'Not run yet' };
                return (
                  <div key={test.id} className="border border-slate-700 rounded p-2">
                    <div className="font-medium">{test.name}</div>
                    <div className={`text-sm ${statusClass(state.status)}`}>{state.status.toUpperCase()}</div>
                    <div className="text-sm text-slate-300">{state.detail}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
