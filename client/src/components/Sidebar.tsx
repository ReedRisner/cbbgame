import { NavLink } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'], ['/teams', 'Teams'], ['/conferences', 'Conferences'], ['/players', 'Players'],
  ['/coaches', 'Coaches'], ['/recruits', 'Recruit Board'], ['/search', 'Search']
];

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-slate-700 p-3 space-y-1">
      <h1 className="font-bold text-lg mb-2">CBB Coach Sim</h1>
      {links.map(([to, label]) => (
        <NavLink key={to} to={to} className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-slate-800'}`}>
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
