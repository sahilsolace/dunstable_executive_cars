'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Car, AlertTriangle, FileText, Wrench, Receipt, ClipboardCheck,
  Calendar, MapPin, User, ShieldCheck, Info, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { StatusChip } from '@/components/status-chip';
import { DueDateBadge } from '@/components/due-date-badge';
import { DataTable, type Column } from '@/components/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/session-provider';
import { vehicleRepo, personRepo, defectRepo, checkRepo, costRepo, serviceRepo } from '@/lib/repos';
import { fmtReg, fmtMiles, fmtDate, fmtDateTime, fmtGBP } from '@/lib/format';
import { reminderDate, daysUntil } from '@/lib/rules';
import { can } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { Defect, CheckSubmission, CostEntry } from '@/lib/types';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { effectiveUser } = useSession();
  const id = params.id as string;
  if (!effectiveUser) return null;
  const vehicle = vehicleRepo.get(id);

  if (!vehicle) {
    return (
      <PageContainer>
        <div className="py-24 text-center">
          <p className="text-sm font-medium">Vehicle not found</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/fleet/vehicles')}>Back to vehicles</Button>
        </div>
      </PageContainer>
    );
  }

  const driver = vehicle.assignedDriverId ? personRepo.get(vehicle.assignedDriverId) : null;
  const pa = vehicle.assignedPaId ? personRepo.get(vehicle.assignedPaId) : null;
  const defects = defectRepo.list({ vehicleId: vehicle.id });
  const checks = checkRepo.list({ vehicleId: vehicle.id });
  const costs = costRepo.list({ vehicleId: vehicle.id });
  const schedule = serviceRepo.get(vehicle.id);

  // Availability gate — blocking reasons
  const blockers: { reason: string; detail: string }[] = [];
  if (vehicle.offRoad) blockers.push({ reason: 'Marked off-road', detail: 'Vehicle is explicitly off-road' });
  if (vehicle.status === 'blocked') blockers.push({ reason: 'Status: Blocked', detail: vehicle.statusReason });
  const motDays = daysUntil(vehicle.motExpiry);
  if (motDays < 0) blockers.push({ reason: 'MOT expired', detail: `Expired ${Math.abs(motDays)} days ago` });
  const councilDays = daysUntil(vehicle.councilSixMonthDue);
  if (councilDays < 0) blockers.push({ reason: 'Council six-month check expired', detail: `Expired ${Math.abs(councilDays)} days ago` });
  const criticalDefects = defects.filter(d => d.severity === 'critical' && d.status !== 'closed' && d.status !== 'verified');
  for (const d of criticalDefects) {
    blockers.push({ reason: `Critical defect: ${d.ref}`, detail: d.title });
  }
  if (driver && driver.drivingClearance === 'blocked') {
    blockers.push({ reason: 'Assigned driver clearance blocked', detail: driver.drivingClearanceReason });
  }

  // Replacement vehicle suggestion — find an available vehicle of same type
  const replacement = vehicleRepo.list({ companyId: vehicle.companyId }).find(v =>
    v.id !== vehicle.id && v.type === vehicle.type && v.status === 'ready' && !v.offRoad && !v.assignedDriverId
  );

  // Reminder dates (one calendar month before, clamped to month end)
  const motReminder = reminderDate(vehicle.motExpiry);
  const councilReminder = reminderDate(vehicle.councilSixMonthDue);

  const defectColumns: Column<Defect>[] = [
    { key: 'ref', header: 'Ref', sortValue: d => d.ref, render: d => <Link href={`/defects/${d.id}`} className="font-medium text-brand hover:underline">{d.ref}</Link> },
    { key: 'title', header: 'Title', render: d => d.title },
    { key: 'severity', header: 'Severity', sortValue: d => d.severity, render: d => <span className={cn('text-xs font-medium', d.severity === 'critical' && 'text-bad-fg', d.severity === 'major' && 'text-warn-fg', d.severity === 'minor' && 'text-muted-foreground')}>{d.severity}</span> },
    { key: 'status', header: 'Status', sortValue: d => d.status, render: d => <span className="text-xs">{d.status.replace(/_/g, ' ')}</span> },
    { key: 'reportedAt', header: 'Reported', sortValue: d => d.reportedAt, render: d => <span className="text-xs text-muted-foreground tnum">{fmtDate(d.reportedAt)}</span> },
  ];

  const checkColumns: Column<CheckSubmission>[] = [
    { key: 'submittedAt', header: 'Submitted', sortValue: c => c.submittedAt, render: c => <span className="text-xs tnum">{fmtDateTime(c.submittedAt)}</span> },
    { key: 'receivedAt', header: 'Received', sortValue: c => c.receivedAt, render: c => <span className="text-xs tnum">{fmtDateTime(c.receivedAt)}</span> },
    { key: 'offline', header: 'Offline', render: c => c.offline ? <span className="text-xs font-medium text-warn-fg">Offline</span> : <span className="text-xs text-muted-foreground">Online</span> },
    { key: 'passed', header: 'Result', render: c => c.passed ? <span className="text-xs text-ok-fg font-medium">Passed</span> : <span className="text-xs text-bad-fg font-medium">{c.criticalFailures} critical</span> },
    { key: 'mileage', header: 'Mileage', sortValue: c => c.endMileage, render: c => <span className="text-xs tnum">{fmtMiles(c.endMileage)}</span> },
  ];

  const costColumns: Column<CostEntry>[] = [
    { key: 'date', header: 'Date', sortValue: c => c.date, render: c => <span className="text-xs tnum">{fmtDate(c.date)}</span> },
    { key: 'category', header: 'Category', render: c => <span className="text-xs">{c.category}</span> },
    { key: 'description', header: 'Description', render: c => c.description },
    { key: 'vendor', header: 'Vendor', render: c => <span className="text-sm text-muted-foreground">{c.vendor}</span> },
    { key: 'amount', header: 'Amount', sortValue: c => c.amountGBP, render: c => <span className={cn('tnum text-sm', c.doubleCountedFlag && 'text-muted-foreground line-through')}>{fmtGBP(c.amountGBP)}</span> },
  ];

  return (
    <PageContainer>
      <Link href="/fleet/vehicles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to vehicles
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
            <Car className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tnum">{fmtReg(vehicle.registration)}</h1>
              <StatusChip status={vehicle.status} />
              {vehicle.offRoad && <span className="rounded border border-bad/30 bg-bad-soft px-2 py-0.5 text-xs font-medium text-bad-fg">Off-road</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{vehicle.make} {vehicle.model} · {vehicle.year} · {typeLabel(vehicle.type)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {personRepo.get(vehicle.assignedDriverId ?? '') ? 'Assigned' : 'Unassigned'}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Last verified {fmtDate(vehicle.lastVerifiedAt)}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {vehicle.reviewer}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {can(effectiveUser, 'edit', 'vehicles') && <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh MOT</Button>}
          {can(effectiveUser, 'edit', 'vehicles') && <Button size="sm">Edit vehicle</Button>}
        </div>
      </div>

      {/* Status reason banner */}
      <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium text-muted-foreground">Status detail</p>
          <p className="mt-0.5 text-sm">{vehicle.statusReason}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Source: {vehicle.statusSource} · Reviewer: {vehicle.reviewer} · Last verified: {fmtDateTime(vehicle.lastVerifiedAt)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="defects">Defects ({defects.length})</TabsTrigger>
              <TabsTrigger value="checks">Checks ({checks.length})</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Registration" value={fmtReg(vehicle.registration)} />
                <Field label="Make / model" value={`${vehicle.make} ${vehicle.model}`} />
                <Field label="Year" value={String(vehicle.year)} />
                <Field label="Type" value={typeLabel(vehicle.type)} />
                <Field label="Current mileage" value={fmtMiles(vehicle.currentMileage)} />
                <Field label="Service interval" value={`${fmtMiles(vehicle.serviceIntervalMiles)} / ${vehicle.serviceIntervalMonths}mo`} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Assigned driver</p>
                  {driver ? (
                    <Link href={`/people/drivers/${driver.id}`} className="mt-1 flex items-center gap-2 text-sm hover:text-brand">
                      <User className="h-3.5 w-3.5" /> {driver.name}
                    </Link>
                  ) : <p className="mt-1 text-sm text-muted-foreground">Unassigned</p>}
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Assigned PA</p>
                  {pa ? (
                    <Link href={`/people/pas/${pa.id}`} className="mt-1 flex items-center gap-2 text-sm hover:text-brand">
                      <User className="h-3.5 w-3.5" /> {pa.name}
                    </Link>
                  ) : <p className="mt-1 text-sm text-muted-foreground">None</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="mt-4 space-y-4">
              {/* Two separate date fields — MOT and council six-month */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Annual MOT</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="MOT expiry" value={<DueDateBadge date={vehicle.motExpiry} />} />
                    <Field label="Last passed" value={fmtDate(vehicle.motLastPassed)} />
                    <Field label="Reminder date" value={fmtDate(motReminder)} />
                    <Field label="Days until due" value={String(daysUntil(vehicle.motExpiry))} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reminder is one calendar month before the due date, clamped to the last day of the previous month.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Council six-month check</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="Six-month due" value={<DueDateBadge date={vehicle.councilSixMonthDue} />} />
                    <Field label="Last checked" value={fmtDate(vehicle.councilLastChecked)} />
                    <Field label="Reminder date" value={fmtDate(councilReminder)} />
                    <Field label="Days until due" value={String(daysUntil(vehicle.councilSixMonthDue))} />
                  </div>
                  <div className="flex items-start gap-2 rounded border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>This date is independent of the MOT. An MOT refresh never changes this field.</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Other documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="Insurance expiry" value={<DueDateBadge date={vehicle.insuranceExpiry} />} />
                    <Field label="PCO licence expiry" value={<DueDateBadge date={vehicle.pcoLicenceExpiry} />} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Servicing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="Next service date" value={<DueDateBadge date={vehicle.nextServiceDate} />} />
                    <Field label="Next service mileage" value={vehicle.nextServiceMileage ? fmtMiles(vehicle.nextServiceMileage) : '—'} />
                    <Field label="Trigger" value={schedule ? serviceTrigger(schedule, vehicle.currentMileage) : '—'} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Earlier of date or mileage trigger wins.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="defects" className="mt-4">
              <DataTable columns={defectColumns} rows={defects} getRowId={d => d.id} onRowClick={d => router.push(`/defects/${d.id}`)} enableExport={false} emptyTitle="No defects recorded" />
            </TabsContent>

            <TabsContent value="checks" className="mt-4">
              <DataTable columns={checkColumns} rows={checks} getRowId={c => c.id} enableExport={false} emptyTitle="No checks submitted" />
            </TabsContent>

            <TabsContent value="costs" className="mt-4">
              <DataTable columns={costColumns} rows={costs} getRowId={c => c.id} enableExport={false} emptyTitle="No costs recorded" />
              <p className="mt-2 text-xs text-muted-foreground">
                {costs.some(c => c.doubleCountedFlag) && 'Note: line-through entries are flagged as double-counted and excluded from totals. '}
                Total (excluding double-counted): {fmtGBP(costs.filter(c => !c.doubleCountedFlag).reduce((s, c) => s + c.amountGBP, 0))}
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: availability gate */}
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              {blockers.length === 0 ? <CheckCircle2 className="h-5 w-5 text-ok" /> : <XCircle className="h-5 w-5 text-bad" />}
              <h3 className="text-sm font-semibold">Availability gate</h3>
            </div>
            {blockers.length === 0 ? (
              <p className="mt-2 text-sm text-ok-fg">Available for allocation. No blockers detected.</p>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Blocking reasons ({blockers.length})</p>
                {blockers.map((b, i) => (
                  <div key={i} className="rounded border border-bad/20 bg-bad-soft/50 p-2">
                    <p className="text-xs font-medium text-bad-fg">{b.reason}</p>
                    <p className="text-xs text-muted-foreground">{b.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {blockers.length > 0 && replacement && (
            <div className="rounded-md border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Suggested replacement</h3>
              <p className="mt-2 text-sm">
                <Link href={`/fleet/vehicles/${replacement.id}`} className="font-medium text-brand hover:underline tnum">
                  {fmtReg(replacement.registration)}
                </Link>
                {' '}{replacement.make} {replacement.model}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Same vehicle type, available and unassigned.</p>
            </div>
          )}

          {blockers.length > 0 && !replacement && (
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">No replacement available</h3>
              <p className="mt-1 text-xs text-muted-foreground">No unassigned {typeLabel(vehicle.type)} vehicles are currently available.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function typeLabel(t: string): string {
  return { saloonsaloon: 'Saloonsaloon', executive_saloonsaloon: 'Executive saloonsaloon', mpv: 'MPV', wav: 'Wheelchair accessible', minibus: 'Minibus' }[t] ?? t;
}

function serviceTrigger(s: { nextDate?: string; nextMileage?: number }, currentMileage: number): string {
  const dateDue = s.nextDate ? daysUntil(s.nextDate) <= 31 : false;
  const mileageDue = s.nextMileage ? currentMileage >= s.nextMileage - 500 : false;
  if (dateDue && mileageDue) return 'Both';
  if (dateDue) return 'Date';
  if (mileageDue) return 'Mileage';
  return 'Not due';
}
