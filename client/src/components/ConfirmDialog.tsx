export default function ConfirmDialog({
  open, title, message, onCancel, onConfirm
}: { open: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="card max-w-md w-full">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="mt-2 text-slate-300">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 rounded bg-slate-700" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-2 rounded bg-rose-700" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
