import { ReactNode } from 'react';

export default function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b border-slate-700">{headers.map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/60">{row.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
