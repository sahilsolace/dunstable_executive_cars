import * as React from 'react';
import { cn } from '@/lib/utils';
import { fmtDate, daysUntilLabel } from '@/lib/format';

export function DueDateBadge({ date, className }: { date?: string; className?: string }) {
  if (!date) return <span className={cn('text-muted-foreground', className)}>—</span>;
  const today = new Date('2026-10-27T00:00:00Z');
  const d = new Date(date);
  const days = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const overdue = days < 0;
  const soon = days >= 0 && days <= 31;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 tnum',
      overdue && 'text-bad-fg font-medium',
      soon && !overdue && 'text-warn-fg font-medium',
      !overdue && !soon && 'text-muted-foreground',
      className
    )}>
      <span>{fmtDate(date)}</span>
      <span className={cn('text-xs', overdue && 'text-bad', soon && !overdue && 'text-warn')}>
        {daysUntilLabel(date)}
      </span>
    </span>
  );
}
