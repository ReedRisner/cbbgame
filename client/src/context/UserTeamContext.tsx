import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type UserTeamContextValue = {
  userTeamId: number | null;
  setUserTeamId: (teamId: number | null) => void;
  resetProgress: () => void;
};

const UserTeamContext = createContext<UserTeamContextValue | undefined>(undefined);
const STORAGE_KEY = 'cbb_user_team_id';

export function UserTeamProvider({ children }: { children: React.ReactNode }) {
  const [userTeamId, setUserTeamIdState] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setUserTeamIdState(Number(raw));
  }, []);

  const setUserTeamId = (teamId: number | null) => {
    setUserTeamIdState(teamId);
    if (teamId == null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(teamId));
  };

  const resetProgress = () => {
    localStorage.removeItem('cbb_season_state');
  };

  const value = useMemo(() => ({ userTeamId, setUserTeamId, resetProgress }), [userTeamId]);
  return <UserTeamContext.Provider value={value}>{children}</UserTeamContext.Provider>;
}

export function useUserTeam() {
  const ctx = useContext(UserTeamContext);
  if (!ctx) throw new Error('useUserTeam must be used in UserTeamProvider');
  return ctx;
}
