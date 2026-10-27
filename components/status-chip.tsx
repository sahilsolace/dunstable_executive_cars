import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Status } from '@/lib/types';

const cfg: Record<Status, { label: string; icon: React.ElementType; cls: string }> = {
  ready: { label: 'Ready', icon: CheckCircle2, cls: 'bg-ok-soft text-ok-fg border-ok/30' },
  due_soon: { label: 'Due soon', icon: AlertTriangle, cls: 'bg-warn-soft text-warn-fg border-warn/30' },
  blocked: { label: 'Blocked', icon: XCircle, cls: 'bg-bad-soft text-bad-fg border-bad/30' },
  verification_pending: { label: 'Verification pending', icon: Clock, cls: 'bg-pending-soft text-pending-fg border-pending/30' },
};

export function StatusChip({ status, size = 'sm', className }: { status: Status; size?: 'sm' | 'xs'; className?: string }) {
  const c = cfg[status];
  const Icon = c.icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded border font-medium whitespace-nowrap',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-0.5 text-[10px]',
      c.cls, className
    )}>
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {c.label}
    </span>
  );
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  const c = cfg[status];
  return <span className={cn('inline-block h-2 w-2 rounded-full', `bg-${status === 'ready' ? 'ok' : status === 'due_soon' ? 'warn' : status === 'blocked' ? 'bad' : 'pending'}`, className)} />;
}

export const statusLabel = (s: Status) => cfg[s].label;
