'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/components/session-provider';
import { AppShell } from '@/components/app-shell';
import { canAccessRoute } from '@/lib/permissions';
import { ShieldAlert } from 'lucide-react';

const PUBLIC_ROUTES = ['/login'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { effectiveUser, hydrated } = useSession();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated) return;
    const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
    if (!effectiveUser && !isPublic) {
      router.replace('/login');
      return;
    }
    if (effectiveUser && pathname === '/login') {
      router.replace('/dashboard');
      return;
    }
    setChecked(true);
  }, [hydrated, effectiveUser, pathname, router]);

  if (!hydrated || !checked) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!effectiveUser) return <>{children}</>;

  if (!canAccessRoute(effectiveUser, pathname)) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <ShieldAlert className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="text-base font-semibold">You don&apos;t have access to this area</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Your role ({effectiveUser.role.replace('_', ' ')}) does not permit access to this section.
              Contact an administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
