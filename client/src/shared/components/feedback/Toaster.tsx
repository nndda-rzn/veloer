import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastLevel = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  level?: ToastLevel;
  duration?: number | null;
  action?: ToastAction;
}

interface ToastEntry {
  id: string;
  title?: string;
  description?: string;
  level: ToastLevel;
  duration: number | null;
  action?: ToastAction;
  createdAt: number;
}

interface ToastContextValue {
  pushToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 4;
let counter = 0;

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, options?: ToastOptions): string => {
      counter += 1;
      const id = `toast-${Date.now()}-${counter}`;
      const entry: ToastEntry = {
        id,
        title: options?.title ?? message,
        description: options?.description,
        level: options?.level ?? 'info',
        duration: options?.duration === undefined ? DEFAULT_DURATION : options.duration,
        action: options?.action,
        createdAt: Date.now(),
      };

      setToasts((current) => {
        const next = [...current, entry];
        if (next.length > MAX_VISIBLE) {
          const removed = next.slice(0, next.length - MAX_VISIBLE);
          for (const toast of removed) {
            const timer = timersRef.current.get(toast.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(toast.id);
            }
          }
          return next.slice(-MAX_VISIBLE);
        }
        return next;
      });

      if (entry.duration !== null) {
        const timer = setTimeout(() => dismissToast(id), entry.duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ pushToast, dismissToast }),
    [pushToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToasterProvider');
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastEntry[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      data-slot="toaster"
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const LEVEL_CLASSES: Record<ToastLevel, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

function ToastCard({ toast, onDismiss }: { toast: ToastEntry; onDismiss: (id: string) => void }) {
  return (
    <div
      role={toast.level === 'error' ? 'alert' : 'status'}
      aria-live={toast.level === 'error' ? 'assertive' : 'polite'}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur transition-all animate-in fade-in-0 slide-in-from-top-2 sm:slide-in-from-right-2 ${LEVEL_CLASSES[toast.level]}`}
    >
      <div className="flex-1 space-y-0.5 text-sm">
        {toast.title && <p className="font-semibold">{toast.title}</p>}
        {toast.description && (
          <p className="text-xs leading-relaxed opacity-90">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            className="mt-1 text-xs font-semibold underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-current opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => onDismiss(toast.id)}
      >
        <span aria-hidden="true" className="block h-3 w-3 leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
