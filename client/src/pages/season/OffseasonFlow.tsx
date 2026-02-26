const steps = ['End-of-season summary','Departures','Coaching changes','Portal marketplace','Recruiting','NIL management','Roster review','Advance to next season'];
export default function OffseasonFlow(){return <div className="card"><h2 className="font-semibold text-xl mb-3">Offseason Flow</h2><ol className="space-y-2 list-decimal pl-5">{steps.map(s=><li key={s}>{s}</li>)}</ol></div>}
