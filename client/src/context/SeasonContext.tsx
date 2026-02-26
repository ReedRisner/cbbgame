import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SeasonState = { season: number; week: number; phase: string };

type SeasonContextValue = {
  state: SeasonState;
  setState: (v: SeasonState) => void;
};

const SeasonContext = createContext<SeasonContextValue | undefined>(undefined);
const STORAGE_KEY = 'cbb_season_state';

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<SeasonState>({ season: 1, week: 1, phase: 'Preseason' });
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setStateRaw(JSON.parse(raw));
  }, []);
  const setState = (v: SeasonState) => {
    setStateRaw(v);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  };
  const value = useMemo(() => ({ state, setState }), [state]);
  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeasonState() {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error('useSeasonState must be used in SeasonProvider');
  return ctx;
}
