'use client';

import * as React from 'react';
import { GraduationCap } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { DataTable, type Column } from '@/components/data-table';
import { DueDateBadge } from '@/components/due-date-badge';
import { useSession } from '@/components/session-provider';
import { personRepo } from '@/lib/repos';
import { fmtDate } from '@/lib/format';
import { daysUntil } from '@/lib/rules';

interface TrainingRow {
  id: string;
  personName: string;
  personId: string;
  course: string;
  completedAt: string;
  expiresAt?: string;
  verifier: string;
  verified: boolean;
}

export default function TrainingPage() {
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;
  const people = personRepo.list({ companyId: effectiveUser.companyId });

  const rows: TrainingRow[] = people.flatMap(p =>
    p.training.map(t => ({
      id: t.id, personName: p.name, personId: p.id,
      course: t.course, completedAt: t.completedAt, expiresAt: t.expiresAt,
      verifier: t.verifier, verified: t.verified,
    }))
  );

  const columns: Column<TrainingRow>[] = [
    { key: 'personName', header: 'Person', sortValue: r => r.personName, render: r => <span className="font-medium">{r.personName}</span> },
    { key: 'course', header: 'Course', sortValue: r => r.course, render: r => r.course },
    { key: 'completedAt', header: 'Completed', sortValue: r => r.completedAt, render: r => <span className="text-xs tnum text-muted-foreground">{fmtDate(r.completedAt)}</span> },
    { key: 'expiresAt', header: 'Expires', sortValue: r => r.expiresAt ?? '', render: r => r.expiresAt ? <DueDateBadge date={r.expiresAt} /> : <span className="text-xs text-muted-foreground">No expiry</span> },
    { key: 'verifier', header: 'Verifier', render: r => <span className="text-sm text-muted-foreground">{r.verifier}</span> },
    { key: 'verified', header: 'Verified', sortValue: r => r.verified ? '1' : '0', render: r => r.verified ? <span className="text-xs text-ok-fg font-medium">Yes</span> : <span className="text-xs text-warn-fg">Pending</span> },
  ];

  const expiringSoon = rows.filter(r => r.expiresAt && daysUntil(r.expiresAt) <= 90);

  return (
    <PageContainer>
      <PageHeader
        title="Training"
        description={`${rows.length} training records. ${expiringSoon.length} expiring within 90 days.`}
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={r => r.id}
          searchPlaceholder="Search by person or course…"
          searchFn={(r, q) => `${r.personName} ${r.course}`.toLowerCase().includes(q)}
          exportFilename="training"
          emptyIcon={GraduationCap}
          emptyTitle="No training records"
          emptyDescription="Training records for drivers and passenger assistants will appear here."
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Training renewal intervals are set by operator policy. No statutory renewal interval is assumed for PAT, MiDAS or other courses.
      </p>
    </PageContainer>
  );
}
