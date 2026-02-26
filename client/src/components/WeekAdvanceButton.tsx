export default function WeekAdvanceButton({
  loading,
  onClick,
  label = 'Advance Week'
}: { loading: boolean; onClick: () => void; label?: string }) {
  return (
    <button disabled={loading} onClick={onClick} className="px-4 py-2 rounded bg-blue-700 disabled:opacity-60">
      {loading ? 'Simulating...' : label}
    </button>
  );
}
