import { Link } from 'react-router-dom';

export default function PostseasonHub() {
  return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Postseason Hub</h2>
      <div className="grid md:grid-cols-2 gap-2">
        <Link className="rounded bg-slate-800 p-3 hover:bg-slate-700" to="/postseason/conference">Conference Tournaments</Link>
        <Link className="rounded bg-slate-800 p-3 hover:bg-slate-700" to="/postseason/selection">Selection Sunday</Link>
        <Link className="rounded bg-slate-800 p-3 hover:bg-slate-700" to="/postseason/ncaa">NCAA Tournament</Link>
        <Link className="rounded bg-slate-800 p-3 hover:bg-slate-700" to="/postseason/nit">NIT / CBI / CIT</Link>
      </div>
    </div>
  );
}
