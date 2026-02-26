import { useToasts } from '../context/ToastContext';

const color = { success: 'bg-emerald-700', warning: 'bg-amber-700', info: 'bg-sky-700', error: 'bg-rose-700' };

export default function ToastStack() {
  const { toasts, closeToast } = useToasts();
  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`w-80 rounded p-3 text-sm ${color[t.type]}`}>
          <div className="flex items-start justify-between gap-2">
            <p>{t.message}</p>
            <button onClick={() => closeToast(t.id)} className="text-white/80">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
