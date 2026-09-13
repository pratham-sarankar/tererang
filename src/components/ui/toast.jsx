import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-background p-4 text-sm shadow-lg',
            toast.type === 'error' ? 'border-destructive/40' : 'border-border'
          )}
        >
          {toast.type === 'error' ? (
            <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium">{toast.title}</p>
            {toast.description && <p className="mt-1 text-muted-foreground">{toast.description}</p>}
          </div>
          <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => onDismiss(toast.id)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
