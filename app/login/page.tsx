'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/session-provider';
import { DEMO_USERS, roleLabel } from '@/lib/permissions';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

const LOGO_URL = '/image.png';

const ROLES: Role[] = ['owner', 'company_manager', 'controller', 'driver_pa', 'mechanic', 'hr_vetting', 'auditor'];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Full access to all modules, companies, users, integrations and audit.',
  company_manager: 'Manage vehicles, defects, people and release vehicles to service.',
  controller: 'View-only operational dashboard. DBS summary only — no certificate detail.',
  driver_pa: 'Driver and passenger assistant view — daily checks and assignments.',
  mechanic: 'Workshop, defects verification and maintenance scheduling.',
  hr_vetting: 'Licence checking, DBS review and safeguarding case management.',
  auditor: 'Read-only access including audit log and exports.',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [selected, setSelected] = React.useState<Role>('owner');

  const handleLogin = (role: Role) => {
    login(role);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="flex flex-col justify-between bg-card p-8 lg:w-2/5 lg:p-12 border-r border-border">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Dunstable Executive Cars" className="h-9 w-auto" />
        </div>
        <div className="py-12">
          <h1 className="text-2xl font-semibold tracking-tight">Fleet &amp; Workforce Management</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm">
            Operations dashboard for Dunstable Executive Cars. Vehicle compliance, daily checks,
            defect management, driver and PA clearance, and safeguarding assurance.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['DVSA compliant checks', 'Council six-month tracking', 'DBS assurance', 'Multi-depot'].map(tag => (
              <span key={tag} className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Simulated demo environment. No live government data connections. Do not enter real personal data.
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-lg font-semibold">Choose a demo role</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a role to sign in and explore the platform. You can switch roles from the top bar.
          </p>

          <div className="mt-6 space-y-2">
            {ROLES.map(role => {
              const u = DEMO_USERS[role];
              const active = selected === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelected(role)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors',
                    active ? 'border-brand bg-brand-soft' : 'border-border bg-card hover:bg-muted/50',
                  )}
                >
                  <span className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    active ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground',
                  )}>
                    {u.initials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{roleLabel(role)}</p>
                    <p className="text-xs text-muted-foreground truncate">{ROLE_DESCRIPTIONS[role]}</p>
                  </div>
                  {active && <span className="h-2 w-2 rounded-full bg-brand" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleLogin(selected)}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-strong"
          >
            Sign in as {roleLabel(selected)}
          </button>
        </div>
      </div>
    </div>
  );
}
