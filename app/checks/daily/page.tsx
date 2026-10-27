'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Wifi, WifiOff, Lock, AlertTriangle } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { DataTable, type Column } from '@/components/data-table';
import { useSession } from '@/components/session-provider';
import { checkRepo, vehicleRepo, personRepo } from '@/lib/repos';
import { fmtReg, fmtDateTime, fmtMiles } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CheckSubmission } from '@/lib/types';

export default function DailyChecksPage() {
  const router = useRouter();
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;

  const checks = checkRepo.list();
  const vehicles = vehicleRepo.list({ companyId: effectiveUser.companyId });

  // Missing checks today
  const todayStart = '2026-10-27T00:00:00Z';
  const submittedVehicleIds = new Set(checks.filter(c => c.submittedAt >= todayStart).map(c => c.vehicleId));
  const missing = vehicles.filter(v => !submittedVehicleIds.has(v.id) && !v.offRoad);

  const columns: Column<CheckSubmission>[] = [
    {
      key: 'vehicle', header: 'Vehicle', sortValue: c => c.vehicleId,
      render: c => {
        const v = vehicleRepo.get(c.vehicleId);
        return v ? <span className="font-medium tnum">{fmtReg(v.registration)}</span> : c.vehicleId;
      },
    },
    {
      key: 'driver', header: 'Driver', sortValue: c => c.driverId,
      render: c => {
        const d = personRepo.get(c.driverId);
        return d ? <span className="text-sm">{d.name}</span> : <span className="text-xs text-muted-foreground">Unknown</span>;
      },
    },
    {
      key: 'submittedAt', header: 'Completed (driver)', sortValue: c => c.submittedAt,
      render: c => <span className="text-xs tnum">{fmtDateTime(c.submittedAt)}</span>,
    },
    {
      key: 'receivedAt', header: 'Received (server)', sortValue: c => c.receivedAt,
      render: c => {
        const delay = new Date(c.receivedAt).getTime() - new Date(c.submittedAt).getTime();
        const delayMin = Math.round(delay / 60000);
        return (
          <span className={cn('text-xs tnum', delayMin > 60 && 'text-warn-fg font-medium')}>
            {fmtDateTime(c.receivedAt)}
            {delayMin > 5 && <span className="ml-1 text-[10px] text-muted-foreground">(+{delayMin}m)</span>}
          </span>
        );
      },
    },
    {
      key: 'offline', header: 'Mode', sortValue: c => c.offline ? '1' : '0', filterable: true,
      filterOptions: [{ value: '1', label: 'Offline' }, { value: '0', label: 'Online' }],
      render: c => c.offline ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-warn-fg"><WifiOff className="h-3 w-3" /> Offline</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Wifi className="h-3 w-3" /> Online</span>
      ),
    },
    {
      key: 'mileage', header: 'Mileage', sortValue: c => c.endMileage,
      render: c => (
        <span className={cn('text-xs tnum', c.implausibleMileage && 'text-warn-fg font-medium')}>
          {fmtMiles(c.endMileage)}
          {c.implausibleMileage && <AlertTriangle className="ml-1 inline h-3 w-3" />}
        </span>
      ),
    },
    {
      key: 'result', header: 'Result', sortValue: c => c.passed ? '1' : '0',
      render: c => c.passed ? (
        <span className="text-xs font-medium text-ok-fg">Passed</span>
      ) : (
        <span className="text-xs font-medium text-bad-fg">{c.criticalFailures} critical</span>
      ),
    },
    {
      key: 'locked', header: 'Lock', sortValue: c => c.locked ? '1' : '0',
      render: c => c.locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : <span className="text-xs text-muted-foreground">Open</span>,
      hideOnMobile: true,
    },
    {
      key: 'template', header: 'Template ver.', render: c => <span className="text-xs text-muted-foreground tnum">{c.templateVersionId}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Daily Checks"
        description={`${checks.length} submissions. ${missing.length} vehicle${missing.length !== 1 ? 's' : ''} missing a check today.`}
      />

      {missing.length > 0 && (
        <div className="mt-4 rounded-md border border-warn/30 bg-warn-soft/50 p-3">
          <p className="text-sm font-medium text-warn-fg">Missing checks today</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missing.map(v => (
              <button
                key={v.id}
                onClick={() => router.push(`/fleet/vehicles/${v.id}`)}
                className="rounded border border-border bg-card px-2 py-1 text-xs font-medium tnum hover:bg-muted"
              >
                {fmtReg(v.registration)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={checks}
          getRowId={c => c.id}
          searchPlaceholder="Search by vehicle or driver…"
          searchFn={(c, q) => {
            const v = vehicleRepo.get(c.vehicleId);
            const d = personRepo.get(c.driverId);
            return `${v?.registration ?? ''} ${d?.name ?? ''}`.toLowerCase().includes(q);
          }}
          exportFilename="daily-checks"
          emptyIcon={ClipboardCheck}
          emptyTitle="No check submissions"
          emptyDescription="Daily walkaround check submissions will appear here."
        />
      </div>

      {/* Corrections note */}
      {checks.some(c => c.corrections.length > 0) && (
        <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Attributed corrections</p>
          {checks.filter(c => c.corrections.length > 0).map(c => (
            <div key={c.id} className="mt-2 text-xs">
              <span className="font-medium tnum">{vehicleRepo.get(c.vehicleId)?.registration}</span>:
              {c.corrections.map((cor, i) => (
                <span key={i} className="ml-1 text-muted-foreground">
                  &ldquo;{cor.note}&rdquo; — {cor.by}, {fmtDateTime(cor.at)}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
