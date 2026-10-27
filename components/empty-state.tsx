import * as React from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({ icon: Icon, title, description, action, className }: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      {Icon && <Icon className="h-10 w-10 text-muted-foreground/40" />}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry, className }: {
  title?: string; description?: string; onRetry?: () => void; className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent">
          Try again
        </button>
      )}
    </div>
  );
}
