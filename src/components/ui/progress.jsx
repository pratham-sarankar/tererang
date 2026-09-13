import { cn } from '@/lib/utils';

export function Progress({ value = 0, className }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - safeValue}%)` }} />
    </div>
  );
}
