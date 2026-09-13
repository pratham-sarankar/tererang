import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Overlay({ open, onClose, children, className }) {
  if (!open) return null;
  return (
    <div className={cn('fixed inset-0 z-50 bg-black/35', className)} onMouseDown={onClose}>
      {children}
    </div>
  );
}

export function Sheet({ open, onClose, title, description, children, footer, side = 'right', className }) {
  if (!open) return null;
  return (
    <Overlay open={open} onClose={onClose}>
      <aside
        className={cn(
          'fixed top-0 z-50 flex h-full w-full max-w-xl flex-col border bg-background shadow-xl',
          side === 'left' ? 'left-0' : 'right-0',
          className
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t p-5">{footer}</div>}
      </aside>
    </Overlay>
  );
}

export function Dialog({ open, onClose, title, description, children, footer, className }) {
  if (!open) return null;
  return (
    <Overlay open={open} onClose={onClose} className="grid place-items-center p-4">
      <section
        className={cn('w-full max-w-lg rounded-lg border bg-background p-5 shadow-xl', className)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </section>
    </Overlay>
  );
}
