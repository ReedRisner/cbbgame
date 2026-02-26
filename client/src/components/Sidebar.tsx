import { NavLink } from 'react-router-dom';
import { useUserTeam } from '../context/UserTeamContext';

const links = [
  ['/', 'Dashboard'],
  ['/season', 'Season Hub'],
  ['/games/schedule', 'My Schedule'],
  ['/games/week/1', 'Games'],
  ['/standings', 'Standings'],
  ['/rankings/ap', 'Rankings'],
  ['/recruiting/board', 'Recruiting'],
  ['/portal/marketplace', 'Transfer Portal'],
  ['/nil/contracts', 'NIL'],
  ['/coaching/staff', 'Coaching'],
  ['/postseason', 'Postseason'],
  ['/teams', 'Teams'],
  ['/conferences', 'Conferences'],
  ['/players', 'Players'],
  ['/coaches', 'Coaches'],
  ['/recruits', 'Recruits'],
  ['/search', 'Search'],
];

export default function Sidebar() {
  const { userTeamId } = useUserTeam();
  return (
    <aside className="w-56 border-r border-slate-700 p-3 space-y-1">
      <h1 className="font-bold text-lg mb-2">CBB Coach Sim</h1>
      <div className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 mb-2">
        Your Team: {userTeamId ? `#${userTeamId}` : 'Not Selected'}
      </div>
      {links.map(([to, label]) => (
        <NavLink key={to} to={to} className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-slate-800'}`}>
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
