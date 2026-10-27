'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { DataTable, type Column } from '@/components/data-table';
import { useSession } from '@/components/session-provider';
import { defectRepo, vehicleRepo, personRepo } from '@/lib/repos';
import { fmtReg, fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Defect, DefectStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';

const COLUMNS: { status: DefectStatus; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: 'border-bad/30 bg-bad-soft/30' },
  { status: 'triaged', label: 'Triaged', color: 'border-warn/30 bg-warn-soft/30' },
  { status: 'assigned', label: 'Assigned', color: 'border-warn/30 bg-warn-soft/30' },
  { status: 'booked', label: 'Booked', color: 'border-pending/30 bg-pending-soft/30' },
  { status: 'repair_complete', label: 'Repair complete', color: 'border-pending/30 bg-pending-soft/30' },
  { status: 'verified', label: 'Verified', color: 'border-ok/30 bg-ok-soft/30' },
  { status: 'closed', label: 'Closed', color: 'border-border bg-muted/20' },
];

export default function DefectsPage() {
  const router = useRouter();
  const { effectiveUser } = useSession();
  const [view, setView] = React.useState<'kanban' | 'table'>('kanban');
  if (!effectiveUser) return null;
  const defects = defectRepo.list({ companyId: effectiveUser.companyId });

  const tableColumns: Column<Defect>[] = [
    { key: 'ref', header: 'Ref', sortValue: d => d.ref, render: d => <span className="font-medium text-brand">{d.ref}</span> },
    {
      key: 'vehicle', header: 'Vehicle', sortValue: d => d.vehicleId,
      render: d => { const v = vehicleRepo.get(d.vehicleId); return v ? <span className="tnum font-medium">{fmtReg(v.registration)}</span> : d.vehicleId; },
    },
    { key: 'title', header: 'Title', render: d => d.title },
    {
      key: 'severity', header: 'Severity', sortValue: d => d.severity, filterable: true,
      filterOptions: [{ value: 'critical', label: 'Critical' }, { value: 'major', label: 'Major' }, { value: 'minor', label: 'Minor' }],
      render: d => <span className={cn('text-xs font-medium', d.severity === 'critical' && 'text-bad-fg', d.severity === 'major' && 'text-warn-fg', d.severity === 'minor' && 'text-muted-foreground')}>{d.severity}</span>,
    },
    {
      key: 'status', header: 'Status', sortValue: d => d.status, filterable: true,
      filterOptions: COLUMNS.map(c => ({ value: c.status, label: c.label })),
      render: d => <span className="text-xs">{d.status.replace(/_/g, ' ')}</span>,
    },
    { key: 'reportedAt', header: 'Reported', sortValue: d => d.reportedAt, render: d => <span className="text-xs text-muted-foreground tnum">{fmtDate(d.reportedAt)}</span>, hideOnMobile: true },
    { key: 'blocks', header: 'Blocks alloc', sortValue: d => d.blocksAllocation ? '1' : '0', render: d => d.blocksAllocation ? <span className="text-xs font-medium text-bad-fg">Yes</span> : <span className="text-xs text-muted-foreground">No</span>, hideOnMobile: true },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Defects"
        description={`${defects.length} defects. ${defects.filter(d => d.severity === 'critical' && d.status !== 'closed').length} critical open.`}
        actions={
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            <Button variant={view === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('kanban')} className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> Board</Button>
            <Button variant={view === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('table')} className="gap-1.5"><TableIcon className="h-3.5 w-3.5" /> Table</Button>
          </div>
        }
      />

      {view === 'table' ? (
        <div className="mt-6">
          <DataTable
            columns={tableColumns}
            rows={defects}
            getRowId={d => d.id}
            onRowClick={d => router.push(`/defects/${d.id}`)}
            searchPlaceholder="Search by ref, vehicle or title…"
            searchFn={(d, q) => `${d.ref} ${d.title} ${vehicleRepo.get(d.vehicleId)?.registration ?? ''}`.toLowerCase().includes(q)}
            exportFilename="defects"
            emptyIcon={AlertTriangle}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {COLUMNS.map(col => {
            const items = defects.filter(d => d.status === col.status);
            return (
              <div key={col.status} className={cn('rounded-md border p-2 min-h-[120px]', col.color)}>
                <div className="flex items-center justify-between px-1 py-1">
                  <p className="text-xs font-semibold">{col.label}</p>
                  <span className="text-xs text-muted-foreground tnum">{items.length}</span>
                </div>
                <div className="space-y-2 mt-2">
                  {items.map(d => {
                    const v = vehicleRepo.get(d.vehicleId);
                    return (
                      <button
                        key={d.id}
                        onClick={() => router.push(`/defects/${d.id}`)}
                        className="w-full rounded border border-border bg-card p-2 text-left transition-shadow hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-brand">{d.ref}</span>
                          {d.severity === 'critical' && <span className="h-1.5 w-1.5 rounded-full bg-bad" />}
                        </div>
                        <p className="mt-1 text-xs font-medium line-clamp-2">{d.title}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground tnum">{v ? fmtReg(v.registration) : ''}</p>
                      </button>
                    );
                  })}
                  {items.length === 0 && <p className="px-1 py-2 text-[10px] text-muted-foreground">No items</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional statuses note */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>Additional statuses:</span>
        {['monitored', 'rejected_duplicate', 'reopened'].map(s => (
          <span key={s} className="rounded border border-border bg-muted px-2 py-0.5">{s.replace(/_/g, ' ')}</span>
        ))}
      </div>
    </PageContainer>
  );
}
