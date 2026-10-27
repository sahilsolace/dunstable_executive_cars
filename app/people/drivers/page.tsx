'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { DataTable, type Column } from '@/components/data-table';
import { StatusChip } from '@/components/status-chip';
import { useSession } from '@/components/session-provider';
import { personRepo } from '@/lib/repos';
import { fmtDate } from '@/lib/format';
import { daysUntil } from '@/lib/rules';
import { Button } from '@/components/ui/button';
import type { Person } from '@/lib/types';

export default function DriversPage() {
  const router = useRouter();
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;
  const drivers = personRepo.list({ companyId: effectiveUser.companyId, role: 'driver' });

  const columns: Column<Person>[] = [
    { key: 'name', header: 'Name', sortValue: p => p.name, render: p => <span className="font-medium">{p.name}</span> },
    { key: 'roles', header: 'Roles', render: p => <span className="text-xs text-muted-foreground">{p.roles.map(r => r === 'passenger_assistant' ? 'PA' : r === 'dual' ? 'Driver/PA' : 'Driver').join(', ')}</span> },
    {
      key: 'driving', header: 'Driving clearance', sortValue: p => p.drivingClearance, filterable: true,
      filterOptions: [{ value: 'ready', label: 'Ready' }, { value: 'due_soon', label: 'Due soon' }, { value: 'blocked', label: 'Blocked' }, { value: 'verification_pending', label: 'Verification pending' }],
      render: p => <StatusChip status={p.drivingClearance} />,
    },
    {
      key: 'pa', header: 'PA clearance', sortValue: p => p.paClearance,
      render: p => <StatusChip status={p.paClearance} />,
      hideOnMobile: true,
    },
    {
      key: 'licenceExpiry', header: 'Licence expiry', sortValue: p => p.licenceExpiry ?? '',
      render: p => p.licenceExpiry ? <span className="text-xs tnum text-muted-foreground">{fmtDate(p.licenceExpiry)}</span> : <span className="text-xs text-muted-foreground">N/A — PA only</span>,
      hideOnMobile: true,
    },
    {
      key: 'licenceCheckNext', header: 'Next licence check', sortValue: p => p.licenceCheckNext ?? '',
      render: p => p.licenceCheckNext ? <span className="text-xs tnum text-muted-foreground">{fmtDate(p.licenceCheckNext)}</span> : '—',
      hideOnMobile: true,
    },
    {
      key: 'dbs', header: 'DBS', sortValue: p => p.dbsStatus, filterable: true,
      filterOptions: [{ value: 'ready', label: 'Ready' }, { value: 'due_soon', label: 'Due soon' }, { value: 'blocked', label: 'Blocked' }, { value: 'verification_pending', label: 'Verification pending' }],
      render: p => <StatusChip status={p.dbsStatus} />,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Drivers"
        description={`${drivers.length} drivers and dual-role staff`}
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add driver</Button>}
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={drivers}
          getRowId={p => p.id}
          onRowClick={p => router.push(`/people/drivers/${p.id}`)}
          searchPlaceholder="Search by name…"
          searchFn={(p, q) => p.name.toLowerCase().includes(q)}
          exportFilename="drivers"
          emptyIcon={Users}
        />
      </div>
    </PageContainer>
  );
}
