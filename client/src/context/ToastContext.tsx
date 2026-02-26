import { createContext, useContext, useMemo, useState } from 'react';

export type ToastItem = { id: string; type: 'success'|'warning'|'info'|'error'; message: string };

type ToastContextValue = {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  closeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const closeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const pushToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => closeToast(id), 6000);
  };

  const value = useMemo(() => ({ toasts, pushToast, closeToast }), [toasts]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used in ToastProvider');
  return ctx;
}
