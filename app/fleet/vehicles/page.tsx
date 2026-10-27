'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Plus } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { DataTable, type Column } from '@/components/data-table';
import { StatusChip } from '@/components/status-chip';
import { DueDateBadge } from '@/components/due-date-badge';
import { useSession } from '@/components/session-provider';
import { vehicleRepo, personRepo, companyRepo } from '@/lib/repos';
import { fmtReg, fmtMiles, fmtDate } from '@/lib/format';
import { daysUntil } from '@/lib/rules';
import type { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function VehiclesPage() {
  const router = useRouter();
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;
  const vehicles = vehicleRepo.list({ companyId: effectiveUser.companyId });

  const columns: Column<Vehicle>[] = [
    {
      key: 'registration', header: 'Reg', sortValue: v => v.registration,
      render: v => <span className="font-medium tnum">{fmtReg(v.registration)}</span>,
      width: '110px',
    },
    {
      key: 'vehicle', header: 'Vehicle', sortValue: v => `${v.make} ${v.model}`,
      render: v => (
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{v.make} {v.model}</p>
          <p className="text-xs text-muted-foreground">{v.year} · {typeLabel(v.type)}</p>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortValue: v => v.status, filterable: true,
      filterOptions: [
        { value: 'ready', label: 'Ready' },
        { value: 'due_soon', label: 'Due soon' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'verification_pending', label: 'Verification pending' },
      ],
      render: v => <StatusChip status={v.status} />,
    },
    {
      key: 'mot', header: 'MOT expiry', sortValue: v => v.motExpiry,
      render: v => <DueDateBadge date={v.motExpiry} />,
      hideOnMobile: true,
    },
    {
      key: 'council', header: 'Council 6-month', sortValue: v => v.councilSixMonthDue,
      render: v => <DueDateBadge date={v.councilSixMonthDue} />,
      hideOnMobile: true,
    },
    {
      key: 'mileage', header: 'Mileage', sortValue: v => v.currentMileage,
      render: v => <span className="tnum text-muted-foreground">{fmtMiles(v.currentMileage)}</span>,
      hideOnMobile: true,
    },
    {
      key: 'driver', header: 'Assigned', sortValue: v => v.assignedDriverId ?? '',
      render: v => {
        const d = v.assignedDriverId ? personRepo.get(v.assignedDriverId) : null;
        return d ? <span className="text-sm">{d.name}</span> : <span className="text-xs text-muted-foreground">Unassigned</span>;
      },
      hideOnMobile: true,
    },
    {
      key: 'offRoad', header: 'Off-road', sortValue: v => v.offRoad ? '1' : '0',
      render: v => v.offRoad ? <span className="text-xs font-medium text-bad-fg">Off-road</span> : <span className="text-xs text-muted-foreground">In service</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Vehicles"
        description={`${vehicles.length} vehicles across ${companyRepo.depots(effectiveUser.companyId).length} depots`}
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add vehicle</Button>}
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={vehicles}
          getRowId={v => v.id}
          onRowClick={v => router.push(`/fleet/vehicles/${v.id}`)}
          searchPlaceholder="Search by registration, make or model…"
          searchFn={(v, q) => `${v.registration} ${v.make} ${v.model}`.toLowerCase().includes(q)}
          exportFilename="vehicles"
          emptyIcon={Car}
          emptyTitle="No vehicles found"
          emptyDescription="No vehicles match the current filters."
        />
      </div>
    </PageContainer>
  );
}

function typeLabel(t: string): string {
  return {
    saloonsaloon: 'Saloonsaloon',
    executive_saloonsaloon: 'Executive saloonsaloon',
    mpv: 'MPV',
    wav: 'Wheelchair accessible',
    minibus: 'Minibus',
  }[t] ?? t;
}
