'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { DataTable, type Column } from '@/components/data-table';
import { StatusChip } from '@/components/status-chip';
import { DueDateBadge } from '@/components/due-date-badge';
import { useSession } from '@/components/session-provider';
import { personRepo } from '@/lib/repos';
import { Button } from '@/components/ui/button';
import type { Person } from '@/lib/types';

export default function PassengerAssistantsPage() {
  const router = useRouter();
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;
  const pas = personRepo.list({ companyId: effectiveUser.companyId, role: 'pa' });

  const columns: Column<Person>[] = [
    { key: 'name', header: 'Name', sortValue: p => p.name, render: p => <span className="font-medium">{p.name}</span> },
    { key: 'roles', header: 'Roles', render: p => <span className="text-xs text-muted-foreground">{p.roles.map(r => r === 'dual' ? 'Driver/PA' : 'PA only').join(', ')}</span> },
    {
      key: 'pa', header: 'PA clearance', sortValue: p => p.paClearance, filterable: true,
      filterOptions: [{ value: 'ready', label: 'Ready' }, { value: 'due_soon', label: 'Due soon' }, { value: 'blocked', label: 'Blocked' }, { value: 'verification_pending', label: 'Verification pending' }],
      render: p => <StatusChip status={p.paClearance} />,
    },
    {
      key: 'dbs', header: 'DBS', sortValue: p => p.dbsStatus, filterable: true,
      filterOptions: [{ value: 'ready', label: 'Ready' }, { value: 'due_soon', label: 'Due soon' }, { value: 'blocked', label: 'Blocked' }, { value: 'verification_pending', label: 'Verification pending' }],
      render: p => <StatusChip status={p.dbsStatus} />,
    },
    {
      key: 'dbsNext', header: 'DBS next review', sortValue: p => p.dbsNextReview ?? '',
      render: p => <DueDateBadge date={p.dbsNextReview} />,
      hideOnMobile: true,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Passenger Assistants"
        description={`${pas.length} passenger assistants. A PA never requires a driving licence.`}
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add PA</Button>}
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={pas}
          getRowId={p => p.id}
          onRowClick={p => router.push(`/people/pas/${p.id}`)}
          searchPlaceholder="Search by name…"
          searchFn={(p, q) => p.name.toLowerCase().includes(q)}
          exportFilename="passenger-assistants"
          emptyIcon={Users}
        />
      </div>
    </PageContainer>
  );
}
