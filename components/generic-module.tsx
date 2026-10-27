'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, PageContainer } from '@/components/page-header';
import { DataTable, type Column } from '@/components/data-table';
import { StatusChip } from '@/components/status-chip';
import { DueDateBadge } from '@/components/due-date-badge';
import { EmptyState } from '@/components/empty-state';
import { useSession } from '@/components/session-provider';
import {
  vehicleRepo, defectRepo, personRepo, checkRepo, companyRepo, serviceRepo,
  workshopRepo, costRepo, incidentRepo, integrationRepo, ruleRepo, auditRepo,
  notificationRepo, greyFleetRepo, templateRepo,
} from '@/lib/repos';
import { fmtReg, fmtDate, fmtDateTime, fmtMiles, fmtGBP, fmtNum } from '@/lib/format';
import { daysUntil, serviceDue } from '@/lib/rules';
import { dbsVisibility, DEMO_USERS } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  Package, CalendarDays, Gauge, Wrench, ClipboardCheck, Receipt,
  ShieldCheck,
  AlertTriangle, Car, Clock, Award, BarChart3, FolderArchive, FileText,
  Building2, UserCog, Scale, Plug, Settings,
} from 'lucide-react';

interface ModuleConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  type: 'table' | 'info' | 'cards';
  columns?: Column<any>[];
  rows?: () => any[];
  getRowId?: (row: any) => string;
  onRowClick?: (row: any, router: ReturnType<typeof useRouter>) => void;
  searchFn?: (row: any, q: string) => boolean;
  exportFilename?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  infoContent?: React.ReactNode;
  cards?: { title: string; value: string; subtext: string; tone: 'ok' | 'warn' | 'bad' | 'pending'; icon: LucideIcon }[];
}

const MODULES: Record<string, ModuleConfig> = {
  '/fleet/equipment': {
    title: 'Equipment',
    description: 'Wheelchairs, restraints, ramps and other vehicle equipment tracking.',
    icon: Package, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Equipment tracking covers wheelchair restraints, ramps, passenger lifts, first aid kits and fire extinguishers fitted to vehicles.
          Each equipment item is linked to a vehicle and has its own inspection cycle.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Wheelchair restraints', count: '8 fitted', status: 'ready' as const },
            { name: 'Ramps', count: '6 fitted', status: 'ready' as const },
            { name: 'Passenger lifts', count: '2 fitted', status: 'verification_pending' as const },
            { name: 'First aid kits', count: '25 fitted', status: 'due_soon' as const },
            { name: 'Fire extinguishers', count: '25 fitted', status: 'ready' as const },
          ].map(e => (
            <div key={e.name} className="rounded-md border border-border bg-card p-3">
              <p className="text-sm font-medium">{e.name}</p>
              <p className="text-xs text-muted-foreground">{e.count}</p>
              <div className="mt-2"><StatusChip status={e.status} size="xs" /></div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  '/fleet/planner': {
    title: 'Assignments & Planner',
    description: 'Vehicle-to-driver and PA assignments with a calendar view.',
    icon: CalendarDays, type: 'table',
    columns: [
      { key: 'vehicle', header: 'Vehicle', sortValue: (v: any) => v.registration, render: (v: any) => <span className="font-medium tnum">{fmtReg(v.registration)}</span> },
      { key: 'driver', header: 'Driver', render: (v: any) => { const d = v.assignedDriverId ? personRepo.get(v.assignedDriverId) : null; return d ? d.name : <span className="text-xs text-muted-foreground">Unassigned</span>; } },
      { key: 'pa', header: 'PA', render: (v: any) => { const p = v.assignedPaId ? personRepo.get(v.assignedPaId) : null; return p ? p.name : <span className="text-xs text-muted-foreground">None</span>; }, hideOnMobile: true },
      { key: 'status', header: 'Status', sortValue: (v: any) => v.status, render: (v: any) => <StatusChip status={v.status} /> },
    ],
    rows: () => vehicleRepo.list({ companyId: 'c-dec' }),
    getRowId: (v: any) => v.id,
    onRowClick: (v: any, router) => router.push(`/fleet/vehicles/${v.id}`),
    searchFn: (v: any, q: string) => `${v.registration} ${v.make} ${v.model}`.toLowerCase().includes(q),
    exportFilename: 'assignments',
    emptyTitle: 'No vehicles', emptyDescription: 'No vehicles found.',
  },
  '/maintenance/services': {
    title: 'Service Schedules',
    description: 'Service due by date or mileage — earlier trigger wins.',
    icon: Gauge, type: 'table',
    columns: [
      { key: 'vehicle', header: 'Vehicle', sortValue: (s: any) => s.vehicleId, render: (s: any) => { const v = vehicleRepo.get(s.vehicleId); return v ? <span className="font-medium tnum">{fmtReg(v.registration)}</span> : s.vehicleId; } },
      { key: 'nextDate', header: 'Next date', sortValue: (s: any) => s.nextDate ?? '', render: (s: any) => <DueDateBadge date={s.nextDate} /> },
      { key: 'nextMileage', header: 'Next mileage', sortValue: (s: any) => s.nextMileage ?? 0, render: (s: any) => s.nextMileage ? <span className="tnum text-sm">{fmtMiles(s.nextMileage)}</span> : '—' },
      { key: 'interval', header: 'Interval', render: (s: any) => <span className="text-xs text-muted-foreground">{fmtMiles(s.intervalMiles)} / {s.intervalMonths}mo</span> },
      { key: 'trigger', header: 'Trigger', render: (s: any) => { const v = vehicleRepo.get(s.vehicleId); if (!v) return '—'; const r = serviceDue({ nextDate: s.nextDate, nextMileage: s.nextMileage, currentMileage: v.currentMileage }); return <span className={cn('text-xs', r.due ? 'text-warn-fg font-medium' : 'text-muted-foreground')}>{r.due ? `Due (${r.reason})` : 'Not due'}</span>; } },
      { key: 'lastCompleted', header: 'Last service', sortValue: (s: any) => s.lastCompletedDate ?? '', render: (s: any) => <span className="text-xs tnum text-muted-foreground">{fmtDate(s.lastCompletedDate)}</span>, hideOnMobile: true },
    ],
    rows: () => serviceRepo.list(),
    getRowId: (s: any) => s.id,
    searchFn: (s: any, q: string) => { const v = vehicleRepo.get(s.vehicleId); return `${v?.registration ?? ''}`.toLowerCase().includes(q); },
    exportFilename: 'service-schedules',
    emptyTitle: 'No service schedules', emptyDescription: 'No service schedules found.',
  },
  '/maintenance/workshop': {
    title: 'Workshop Planner',
    description: 'Scheduled workshop jobs with day/week/month views and conflict detection.',
    icon: Wrench, type: 'table',
    columns: [
      { key: 'ref', header: 'Job ref', sortValue: (w: any) => w.ref, render: (w: any) => <span className="font-medium tnum">{w.ref}</span> },
      { key: 'vehicle', header: 'Vehicle', render: (w: any) => { const v = vehicleRepo.get(w.vehicleId); return v ? <span className="tnum">{fmtReg(v.registration)}</span> : w.vehicleId; } },
      { key: 'type', header: 'Type', render: (w: any) => w.type },
      { key: 'scheduledFor', header: 'Scheduled', sortValue: (w: any) => w.scheduledFor, render: (w: any) => <span className="text-xs tnum">{fmtDateTime(w.scheduledFor)}</span> },
      { key: 'bay', header: 'Bay', render: (w: any) => <span className="text-xs">{w.bay}</span>, hideOnMobile: true },
      { key: 'technician', header: 'Technician', render: (w: any) => <span className="text-sm">{w.technician ?? '—'}</span>, hideOnMobile: true },
      { key: 'status', header: 'Status', sortValue: (w: any) => w.status, filterable: true, filterOptions: [{ value: 'scheduled', label: 'Scheduled' }, { value: 'in_progress', label: 'In progress' }, { value: 'complete', label: 'Complete' }], render: (w: any) => <span className="text-xs">{w.status.replace(/_/g, ' ')}</span> },
      { key: 'cost', header: 'Cost', sortValue: (w: any) => w.cost ?? 0, render: (w: any) => w.cost ? <span className="tnum text-sm">{fmtGBP(w.cost)}</span> : '—', hideOnMobile: true },
    ],
    rows: () => workshopRepo.list(),
    getRowId: (w: any) => w.id,
    exportFilename: 'workshop-jobs',
    emptyTitle: 'No workshop jobs', emptyDescription: 'No workshop jobs scheduled.',
  },
  '/maintenance/inspections': {
    title: 'Inspections',
    description: 'Scheduled inspections with signature capture (simulated).',
    icon: ClipboardCheck, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Inspection forms are completed in the workshop and signed by the inspector. Signatures are captured on-device (simulated in this demo).
        </p>
        <div className="space-y-2">
          {[
            { ref: 'INS-2026-0042', vehicle: 'LK71 ABX', type: 'Council six-month inspection', date: '2027-04-15', status: 'Scheduled' },
            { ref: 'INS-2026-0041', vehicle: 'MX22 CDF', type: 'Council six-month inspection', date: '2026-11-18', status: 'Scheduled' },
            { ref: 'INS-2026-0040', vehicle: 'BD55 KLM', type: 'Post-repair inspection', date: '2026-10-27', status: 'Pending — awaiting verification' },
          ].map(i => (
            <div key={i.ref} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
              <div>
                <p className="text-sm font-medium tnum">{i.ref} — {fmtReg(i.vehicle)}</p>
                <p className="text-xs text-muted-foreground">{i.type} · {fmtDate(i.date)}</p>
              </div>
              <span className="text-xs text-muted-foreground">{i.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  '/maintenance/costs': {
    title: 'Repair & Cost Ledger',
    description: 'All vehicle costs. Double-counted entries are flagged and excluded from totals.',
    icon: Receipt, type: 'table',
    columns: [
      { key: 'date', header: 'Date', sortValue: (c: any) => c.date, render: (c: any) => <span className="text-xs tnum">{fmtDate(c.date)}</span> },
      { key: 'vehicle', header: 'Vehicle', render: (c: any) => { const v = vehicleRepo.get(c.vehicleId); return v ? <span className="tnum">{fmtReg(v.registration)}</span> : c.vehicleId; } },
      { key: 'category', header: 'Category', sortValue: (c: any) => c.category, filterable: true, filterOptions: [{ value: 'fuel', label: 'Fuel' }, { value: 'maintenance', label: 'Maintenance' }, { value: 'repair', label: 'Repair' }, { value: 'insurance', label: 'Insurance' }, { value: 'taxation', label: 'Taxation' }], render: (c: any) => <span className="text-xs">{c.category}</span> },
      { key: 'description', header: 'Description', render: (c: any) => c.description },
      { key: 'vendor', header: 'Vendor', render: (c: any) => <span className="text-sm text-muted-foreground">{c.vendor}</span>, hideOnMobile: true },
      { key: 'amount', header: 'Amount', sortValue: (c: any) => c.amountGBP, render: (c: any) => <span className={cn('tnum text-sm', c.doubleCountedFlag && 'text-muted-foreground line-through')}>{fmtGBP(c.amountGBP)}</span> },
    ],
    rows: () => costRepo.list(),
    getRowId: (c: any) => c.id,
    searchFn: (c: any, q: string) => { const v = vehicleRepo.get(c.vehicleId); return `${v?.registration ?? ''} ${c.description} ${c.vendor}`.toLowerCase().includes(q); },
    exportFilename: 'cost-ledger',
    emptyTitle: 'No cost entries', emptyDescription: 'No costs recorded.',
  },
  '/people/planner': {
    title: 'Workforce Planner',
    description: 'Driver and PA availability and shift planning.',
    icon: CalendarDays, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Plan driver and PA shifts, track leave and availability. Shows who is cleared for duty today.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Available drivers</p>
            <p className="mt-1 text-2xl font-semibold tnum">{personRepo.list({ role: 'driver' }).filter(p => p.drivingClearance === 'ready').length}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Available PAs</p>
            <p className="mt-1 text-2xl font-semibold tnum">{personRepo.list({ role: 'pa' }).filter(p => p.paClearance === 'ready').length}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Unavailable (clearance)</p>
            <p className="mt-1 text-2xl font-semibold tnum text-bad-fg">{personRepo.list().filter(p => p.drivingClearance === 'blocked' || p.paClearance === 'blocked').length}</p>
          </div>
        </div>
      </div>
    ),
  },
  '/assurance/licences': {
    title: 'Licence Checks',
    description: 'Driver licence checking with last/next check, declaration validity and provider status.',
    icon: ShieldCheck, type: 'table',
    columns: [
      { key: 'name', header: 'Driver', sortValue: (p: any) => p.name, render: (p: any) => <span className="font-medium">{p.name}</span> },
      { key: 'licenceExpiry', header: 'Licence expiry', sortValue: (p: any) => p.licenceExpiry ?? '', render: (p: any) => p.licenceExpiry ? <DueDateBadge date={p.licenceExpiry} /> : <span className="text-xs text-muted-foreground">N/A</span> },
      { key: 'lastCheck', header: 'Last check', sortValue: (p: any) => p.licenceCheckLast ?? '', render: (p: any) => <span className="text-xs tnum text-muted-foreground">{fmtDate(p.licenceCheckLast)}</span>, hideOnMobile: true },
      { key: 'nextCheck', header: 'Next check', sortValue: (p: any) => p.licenceCheckNext ?? '', render: (p: any) => p.licenceCheckNext ? <DueDateBadge date={p.licenceCheckNext} /> : '—' },
      { key: 'provider', header: 'Provider', render: (p: any) => <span className="text-xs text-muted-foreground">{p.licenceCheckProvider ?? '—'}</span>, hideOnMobile: true },
      {
        key: 'declaration', header: 'Declaration', render: (p: any) => {
          if (!p.licenceCheckNext) return '—';
          const d = daysUntil(p.licenceCheckNext);
          return d >= 0 ? <span className="text-xs text-ok-fg font-medium">Valid</span> : <span className="text-xs text-bad-fg font-medium">Expired</span>;
        },
      },
    ],
    rows: () => personRepo.list({ role: 'driver' }).filter(p => p.licenceCheckLast),
    getRowId: (p: any) => p.id,
    searchFn: (p: any, q: string) => p.name.toLowerCase().includes(q),
    exportFilename: 'licence-checks',
    emptyTitle: 'No licence checks', emptyDescription: 'No licence check records found.',
  },
  '/assurance/dbs': {
    title: 'DBS Review',
    description: 'DBS clearance status and review dates. Metadata only — no certificate images stored.',
    icon: ShieldCheck, type: 'table',
    columns: [
      { key: 'name', header: 'Name', sortValue: (p: any) => p.name, render: (p: any) => <span className="font-medium">{p.name}</span> },
      {
        key: 'dbsStatus', header: 'DBS status', sortValue: (p: any) => p.dbsStatus, filterable: true,
        filterOptions: [{ value: 'ready', label: 'Cleared' }, { value: 'due_soon', label: 'Due soon' }, { value: 'blocked', label: 'Restricted' }, { value: 'verification_pending', label: 'Pending' }],
        render: (p: any) => {
          const label = p.dbsStatus === 'ready' ? 'Cleared' : p.dbsStatus === 'blocked' ? 'Restricted' : p.dbsStatus === 'due_soon' ? 'Due soon' : 'Pending';
          return <StatusChip status={p.dbsStatus} />;
        },
      },
      { key: 'lastReview', header: 'Last review', sortValue: (p: any) => p.dbsLastReview ?? '', render: (p: any) => <span className="text-xs tnum text-muted-foreground">{fmtDate(p.dbsLastReview)}</span>, hideOnMobile: true },
      { key: 'nextReview', header: 'Next review', sortValue: (p: any) => p.dbsNextReview ?? '', render: (p: any) => <DueDateBadge date={p.dbsNextReview} /> },
    ],
    rows: () => personRepo.list(),
    getRowId: (p: any) => p.id,
    searchFn: (p: any, q: string) => p.name.toLowerCase().includes(q),
    exportFilename: 'dbs-review',
    emptyTitle: 'No DBS records', emptyDescription: 'No DBS records found.',
  },
  '/assurance/safeguarding': {
    title: 'Safeguarding Cases',
    description: 'Safeguarding case management. Restricted area — access is logged.',
    icon: ShieldCheck, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <div className="rounded border border-bad/20 bg-bad-soft/30 p-3 text-xs text-bad-fg">
          Restricted area. Every view of this page is recorded in the audit log.
        </div>
        <div className="space-y-2">
          {[
            { id: 'sg-1', person: 'Tara Nichols', opened: '2026-01-15', status: 'Open — suspended from PA duties', detail: 'Allegation under investigation. PA clearance set to Blocked.' },
          ].map(c => (
            <div key={c.id} className="rounded-md border border-border bg-card p-3">
              <p className="text-sm font-medium">{c.id} — {c.person}</p>
              <p className="text-xs text-muted-foreground">Opened {fmtDate(c.opened)}</p>
              <p className="mt-1 text-sm">{c.status}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  '/operations/expenses': {
    title: 'Expenses & Fuel',
    description: 'Fuel and expense records with approval workflow.',
    icon: Receipt, type: 'table',
    columns: [
      { key: 'date', header: 'Date', sortValue: (c: any) => c.date, render: (c: any) => <span className="text-xs tnum">{fmtDate(c.date)}</span> },
      { key: 'vehicle', header: 'Vehicle', render: (c: any) => { const v = vehicleRepo.get(c.vehicleId); return v ? <span className="tnum">{fmtReg(v.registration)}</span> : c.vehicleId; } },
      { key: 'category', header: 'Category', sortValue: (c: any) => c.category, filterable: true, filterOptions: [{ value: 'fuel', label: 'Fuel' }, { value: 'maintenance', label: 'Maintenance' }, { value: 'repair', label: 'Repair' }, { value: 'insurance', label: 'Insurance' }], render: (c: any) => <span className="text-xs">{c.category}</span> },
      { key: 'description', header: 'Description', render: (c: any) => c.description },
      { key: 'amount', header: 'Amount', sortValue: (c: any) => c.amountGBP, render: (c: any) => <span className="tnum text-sm">{fmtGBP(c.amountGBP)}</span> },
      { key: 'approved', header: 'Approved', render: (c: any) => c.approvedBy ? <span className="text-xs text-ok-fg">Yes</span> : <span className="text-xs text-warn-fg">Pending</span>, hideOnMobile: true },
    ],
    rows: () => costRepo.list(),
    getRowId: (c: any) => c.id,
    searchFn: (c: any, q: string) => { const v = vehicleRepo.get(c.vehicleId); return `${v?.registration ?? ''} ${c.description}`.toLowerCase().includes(q); },
    exportFilename: 'expenses',
    emptyTitle: 'No expenses', emptyDescription: 'No expense records found.',
  },
  '/operations/incidents': {
    title: 'Incidents',
    description: 'Accident, damage, near-miss and breakdown reporting.',
    icon: AlertTriangle, type: 'table',
    columns: [
      { key: 'ref', header: 'Ref', sortValue: (i: any) => i.ref, render: (i: any) => <span className="font-medium tnum">{i.ref}</span> },
      { key: 'date', header: 'Date', sortValue: (i: any) => i.date, render: (i: any) => <span className="text-xs tnum">{fmtDate(i.date)}</span> },
      { key: 'type', header: 'Type', sortValue: (i: any) => i.type, filterable: true, filterOptions: [{ value: 'accident', label: 'Accident' }, { value: 'damage', label: 'Damage' }, { value: 'near_miss', label: 'Near miss' }, { value: 'breakdown', label: 'Breakdown' }], render: (i: any) => <span className="text-xs">{i.type.replace(/_/g, ' ')}</span> },
      { key: 'severity', header: 'Severity', sortValue: (i: any) => i.severity, render: (i: any) => <span className={cn('text-xs font-medium', i.severity === 'serious' && 'text-bad-fg', i.severity === 'moderate' && 'text-warn-fg', i.severity === 'minor' && 'text-muted-foreground')}>{i.severity}</span> },
      { key: 'description', header: 'Description', render: (i: any) => <span className="text-sm">{i.description}</span> },
      { key: 'status', header: 'Status', sortValue: (i: any) => i.status, filterable: true, filterOptions: [{ value: 'open', label: 'Open' }, { value: 'investigating', label: 'Investigating' }, { value: 'closed', label: 'Closed' }], render: (i: any) => <span className="text-xs">{i.status}</span> },
    ],
    rows: () => incidentRepo.list(),
    getRowId: (i: any) => i.id,
    searchFn: (i: any, q: string) => `${i.ref} ${i.description} ${i.location}`.toLowerCase().includes(q),
    exportFilename: 'incidents',
    emptyTitle: 'No incidents', emptyDescription: 'No incidents reported.',
  },
  '/operations/grey-fleet': {
    title: 'Grey Fleet',
    description: 'Privately-owned vehicles used for business. Insurance, MOT and business-use checks.',
    icon: Car, type: 'table',
    columns: [
      { key: 'driver', header: 'Driver', sortValue: (g: any) => { const p = personRepo.get(g.driverId); return p?.name ?? g.driverId; }, render: (g: any) => { const p = personRepo.get(g.driverId); return p ? <span className="font-medium">{p.name}</span> : g.driverId; } },
      { key: 'reg', header: 'Registration', sortValue: (g: any) => g.vehicleRegistration, render: (g: any) => <span className="tnum">{fmtReg(g.vehicleRegistration)}</span> },
      { key: 'vehicle', header: 'Vehicle', render: (g: any) => <span className="text-sm text-muted-foreground">{g.makeModel}</span> },
      { key: 'insurance', header: 'Insurance', sortValue: (g: any) => g.insuranceExpiry, render: (g: any) => <DueDateBadge date={g.insuranceExpiry} /> },
      { key: 'mot', header: 'MOT', sortValue: (g: any) => g.motExpiry, render: (g: any) => <DueDateBadge date={g.motExpiry} /> },
      { key: 'businessUse', header: 'Business use', render: (g: any) => g.businessUseConfirmed ? <span className="text-xs text-ok-fg">Confirmed</span> : <span className="text-xs text-bad-fg">Not confirmed</span> },
      { key: 'status', header: 'Status', sortValue: (g: any) => g.status, render: (g: any) => <StatusChip status={g.status} /> },
    ],
    rows: () => greyFleetRepo.list(),
    getRowId: (g: any) => g.id,
    searchFn: (g: any, q: string) => { const p = personRepo.get(g.driverId); return `${p?.name ?? ''} ${g.vehicleRegistration} ${g.makeModel}`.toLowerCase().includes(q); },
    exportFilename: 'grey-fleet',
    emptyTitle: 'No grey fleet entries', emptyDescription: 'No grey fleet vehicles registered.',
  },
  '/specialist/tachograph': {
    title: 'Tachograph & Drivers Hours',
    description: 'Not activated. Activation criteria are shown below.',
    icon: Clock, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <div className="rounded-md border border-warn/30 bg-warn-soft/40 p-3">
          <p className="text-sm font-medium text-warn-fg">Not activated</p>
          <p className="mt-1 text-xs text-muted-foreground">This module is available when the operator runs vehicles subject to tachograph regulations (e.g. vehicles over 3.5t used for hire and reward).</p>
        </div>
        <div>
          <p className="text-sm font-medium">Activation prerequisites</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Vehicles in scope of EU/GB drivers' hours rules</li>
            <li>• Digital tachograph cards issued to drivers</li>
            <li>• Tachograph download and analysis software configured</li>
            <li>• Operator licence category confirming scope</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Module structure (when activated)</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Driver card download schedule</li>
            <li>• Vehicle unit download schedule</li>
            <li>• Drivers' hours compliance dashboard</li>
            <li>• Infringement tracking and reporting</li>
          </ul>
        </div>
      </div>
    ),
  },
  '/specialist/earned-recognition': {
    title: 'Earned Recognition',
    description: 'Not activated. Activation criteria are shown below.',
    icon: Award, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <div className="rounded-md border border-warn/30 bg-warn-soft/40 p-3">
          <p className="text-sm font-medium text-warn-fg">Not activated</p>
          <p className="mt-1 text-xs text-muted-foreground">Earned Recognition is a DVSA voluntary scheme. This platform does not claim Earned Recognition status or approval.</p>
        </div>
        <div>
          <p className="text-sm font-medium">Activation prerequisites</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Operator licence held for minimum period</li>
            <li>• Compliance metrics meeting DVSA thresholds</li>
            <li>• Application submitted to and accepted by DVSA</li>
            <li>• Monthly data submissions configured</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Module structure (when activated)</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Compliance metric dashboard</li>
            <li>• Monthly submission history</li>
            <li>• Defect rate and MOT pass rate tracking</li>
          </ul>
        </div>
      </div>
    ),
  },
  '/insight/reports': {
    title: 'Reports',
    description: 'Scheduled and on-demand reports with CSV/PDF export.',
    icon: BarChart3, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Compliance pack', desc: 'MOT, council check, insurance and licence status for all vehicles', icon: FileText },
            { name: 'Defect ageing', desc: 'Defects by age, severity and status', icon: AlertTriangle },
            { name: 'Repair costs', desc: 'Cost ledger by vehicle, category and month', icon: Receipt },
            { name: 'Due lists', desc: 'All items due within 31 days', icon: CalendarDays },
            { name: 'Driver clearance', desc: 'Licence, DBS and training status for all drivers', icon: ShieldCheck },
            { name: 'Audit log export', desc: 'Access-controlled audit trail', icon: FileText },
          ].map(r => {
            const Icon = r.icon;
            return (
              <div key={r.name} className="rounded-md border border-border bg-card p-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
                <button className="mt-2 text-xs font-medium text-brand hover:underline">Generate report</button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">All exports respect the same role-based permissions as the live screens.</p>
      </div>
    ),
  },
  '/insight/documents': {
    title: 'Documents & Messages',
    description: 'Document storage and internal messages.',
    icon: FolderArchive, type: 'info',
    infoContent: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Documents are organised by vehicle, person and category. Access to restricted documents (DBS, safeguarding) is controlled by role.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { name: 'Vehicle documents', count: '125 files', categories: 'MOT certificates, insurance, V5, council licences' },
            { name: 'Driver documents', count: '60 files', categories: 'Licence copies, training certificates (restricted: DBS — HR only)' },
            { name: 'Incident reports', count: '3 files', categories: 'Accident reports, photos, witness statements' },
            { name: 'Internal messages', count: '12 threads', categories: 'Defect discussions, check queries, workshop notes' },
          ].map(d => (
            <div key={d.name} className="rounded-md border border-border bg-card p-3">
              <p className="text-sm font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.count}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.categories}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  '/insight/audit': {
    title: 'Audit Log',
    description: 'Access-controlled record of all actions, especially restricted data views.',
    icon: FileText, type: 'table',
    columns: [
      { key: 'at', header: 'Timestamp', sortValue: (a: any) => a.at, render: (a: any) => <span className="text-xs tnum">{fmtDateTime(a.at)}</span> },
      { key: 'actor', header: 'Actor', sortValue: (a: any) => a.actor, render: (a: any) => <span className="text-sm">{a.actor}</span> },
      { key: 'role', header: 'Role', render: (a: any) => <span className="text-xs text-muted-foreground">{a.actorRole.replace(/_/g, ' ')}</span> },
      { key: 'action', header: 'Action', sortValue: (a: any) => a.action, render: (a: any) => <span className="text-xs font-medium tnum">{a.action}</span> },
      { key: 'resource', header: 'Resource', render: (a: any) => <span className="text-xs text-muted-foreground">{a.resource}</span>, hideOnMobile: true },
      { key: 'detail', header: 'Detail', render: (a: any) => <span className="text-xs">{a.detail}</span> },
      { key: 'restricted', header: 'Restricted', sortValue: (a: any) => a.restricted ? '1' : '0', render: (a: any) => a.restricted ? <span className="text-xs font-medium text-bad-fg">Yes</span> : <span className="text-xs text-muted-foreground">No</span> },
    ],
    rows: () => auditRepo.list(),
    getRowId: (a: any) => a.id,
    searchFn: (a: any, q: string) => `${a.actor} ${a.action} ${a.resource} ${a.detail ?? ''}`.toLowerCase().includes(q),
    exportFilename: 'audit-log',
    emptyTitle: 'No audit entries', emptyDescription: 'No audit entries recorded.',
  },
  '/admin/companies': {
    title: 'Companies',
    description: 'Create, rename and archive sub-companies. No cap on the number of companies.',
    icon: Building2, type: 'table',
    columns: [
      { key: 'tradingName', header: 'Trading name', sortValue: (c: any) => c.tradingName, render: (c: any) => <span className="font-medium">{c.tradingName}</span> },
      { key: 'legalName', header: 'Legal entity', render: (c: any) => <span className="text-sm text-muted-foreground">{c.legalName}</span> },
      { key: 'depots', header: 'Depots', sortValue: (c: any) => companyRepo.depots(c.id).length, render: (c: any) => <span className="tnum">{companyRepo.depots(c.id).length}</span> },
      { key: 'createdAt', header: 'Created', sortValue: (c: any) => c.createdAt, render: (c: any) => <span className="text-xs tnum text-muted-foreground">{fmtDate(c.createdAt)}</span>, hideOnMobile: true },
      { key: 'archived', header: 'Status', sortValue: (c: any) => c.archived ? '1' : '0', render: (c: any) => c.archived ? <span className="text-xs text-muted-foreground">Archived</span> : <span className="text-xs text-ok-fg font-medium">Active</span> },
    ],
    rows: () => companyRepo.list(),
    getRowId: (c: any) => c.id,
    searchFn: (c: any, q: string) => `${c.tradingName} ${c.legalName}`.toLowerCase().includes(q),
    exportFilename: 'companies',
    emptyTitle: 'No companies', emptyDescription: 'No companies found.',
  },
  '/admin/users': {
    title: 'Users & Roles',
    description: 'User accounts and role assignments. Roles enforce the permission matrix.',
    icon: UserCog, type: 'table',
    columns: [
      { key: 'name', header: 'Name', sortValue: (u: any) => u.name, render: (u: any) => <span className="font-medium">{u.name}</span> },
      { key: 'email', header: 'Email', render: (u: any) => <span className="text-sm text-muted-foreground">{u.email}</span> },
      { key: 'role', header: 'Role', sortValue: (u: any) => u.role, render: (u: any) => <span className="text-xs">{u.role.replace(/_/g, ' ')}</span> },
      { key: 'company', header: 'Company', render: (u: any) => { const c = companyRepo.get(u.companyId); return c ? <span className="text-xs">{c.tradingName}</span> : '—'; }, hideOnMobile: true },
    ],
    rows: () => Object.values(DEMO_USERS),
    getRowId: (u: any) => u.id,
    searchFn: (u: any, q: string) => `${u.name} ${u.email}`.toLowerCase().includes(q),
    exportFilename: 'users',
    emptyTitle: 'No users', emptyDescription: 'No users found.',
  },
  '/admin/rules': {
    title: 'Rules Register',
    description: 'Regulatory rules with source, jurisdiction and review dates. Edits never change historical records.',
    icon: Scale, type: 'table',
    columns: [
      { key: 'name', header: 'Rule', sortValue: (r: any) => r.name, render: (r: any) => <span className="font-medium">{r.name}</span> },
      { key: 'jurisdiction', header: 'Jurisdiction', sortValue: (r: any) => r.jurisdiction, filterable: true, filterOptions: [{ value: 'UK', label: 'UK' }, { value: 'Central Bedfordshire', label: 'Central Bedfordshire' }, { value: 'Luton', label: 'Luton' }, { value: 'Internal', label: 'Internal' }], render: (r: any) => <span className="text-xs">{r.jurisdiction}</span> },
      { key: 'source', header: 'Source', render: (r: any) => <span className="text-xs text-muted-foreground">{r.source}</span>, hideOnMobile: true },
      { key: 'effectiveDate', header: 'Effective', sortValue: (r: any) => r.effectiveDate, render: (r: any) => <span className="text-xs tnum text-muted-foreground">{fmtDate(r.effectiveDate)}</span>, hideOnMobile: true },
      { key: 'reviewer', header: 'Reviewer', render: (r: any) => <span className="text-sm">{r.reviewer}</span> },
      { key: 'nextReview', header: 'Next review', sortValue: (r: any) => r.nextReviewDate, render: (r: any) => <DueDateBadge date={r.nextReviewDate} /> },
      { key: 'status', header: 'Status', sortValue: (r: any) => r.status, render: (r: any) => <span className={cn('text-xs font-medium', r.status === 'active' && 'text-ok-fg', r.status === 'needs_validation' && 'text-warn-fg', r.status === 'draft' && 'text-muted-foreground')}>{r.status.replace(/_/g, ' ')}</span> },
    ],
    rows: () => ruleRepo.list(),
    getRowId: (r: any) => r.id,
    searchFn: (r: any, q: string) => `${r.name} ${r.source} ${r.jurisdiction}`.toLowerCase().includes(q),
    exportFilename: 'rules-register',
    emptyTitle: 'No rules', emptyDescription: 'No rules in the register.',
  },
  '/admin/integrations': {
    title: 'Integrations',
    description: 'Connection register. Honest labels only — no fake live government connections.',
    icon: Plug, type: 'table',
    columns: [
      { key: 'name', header: 'Integration', sortValue: (i: any) => i.name, render: (i: any) => <span className="font-medium">{i.name}</span> },
      { key: 'category', header: 'Category', sortValue: (i: any) => i.category, filterable: true, filterOptions: [{ value: 'Licence checking', label: 'Licence checking' }, { value: 'Vehicle checks', label: 'Vehicle checks' }, { value: 'Council', label: 'Council' }, { value: 'Vetting', label: 'Vetting' }, { value: 'Notifications', label: 'Notifications' }], render: (i: any) => <span className="text-xs">{i.category}</span> },
      {
        key: 'state', header: 'State', sortValue: (i: any) => i.state, filterable: true,
        filterOptions: [{ value: 'live', label: 'Live' }, { value: 'simulated', label: 'Simulated' }, { value: 'not_connected', label: 'Not connected' }, { value: 'manual_verification', label: 'Manual verification' }],
        render: (i: any) => <span className={cn('text-xs font-medium', i.state === 'live' && 'text-ok-fg', i.state === 'simulated' && 'text-warn-fg', i.state === 'not_connected' && 'text-muted-foreground', i.state === 'manual_verification' && 'text-pending-fg')}>{i.state.replace(/_/g, ' ')}</span>,
      },
      { key: 'lastSync', header: 'Last sync', sortValue: (i: any) => i.lastSync ?? '', render: (i: any) => i.lastSync ? <span className="text-xs tnum text-muted-foreground">{fmtDateTime(i.lastSync)}</span> : '—', hideOnMobile: true },
      { key: 'notes', header: 'Notes', render: (i: any) => <span className="text-xs text-muted-foreground">{i.notes}</span>, hideOnMobile: true },
    ],
    rows: () => integrationRepo.list(),
    getRowId: (i: any) => i.id,
    searchFn: (i: any, q: string) => `${i.name} ${i.category} ${i.notes}`.toLowerCase().includes(q),
    exportFilename: 'integrations',
    emptyTitle: 'No integrations', emptyDescription: 'No integrations configured.',
  },
  '/admin/settings': {
    title: 'Settings',
    description: 'Platform-wide settings and preferences.',
    icon: Settings, type: 'info',
    infoContent: (
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm font-medium">Organisation</p>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>Default company: Dunstable Executive Cars</p>
            <p>Timezone: Europe/London</p>
            <p>Date format: DD/MM/YYYY</p>
            <p>Currency: GBP</p>
            <p>Distance: miles</p>
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm font-medium">Compliance reminders</p>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>MOT reminder: 1 calendar month before due (clamped to month end)</p>
            <p>Council six-month reminder: 1 calendar month before due</p>
            <p>Service reminder: 1 month or 500 miles before trigger</p>
            <p>DBS review reminder: per operator policy interval</p>
          </div>
        </div>
      </div>
    ),
  },
};

export function GenericModule({ path }: { path: string }) {
  const router = useRouter();
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;
  const config = MODULES[path];

  if (!config) {
    return (
      <PageContainer>
        <EmptyState title="Module not found" description={`No module configured for ${path}`} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={config.title} description={config.description} />
      <div className="mt-6">
        {config.type === 'table' && config.columns && config.rows && config.getRowId ? (
          <DataTable
            columns={config.columns}
            rows={config.rows()}
            getRowId={config.getRowId}
            onRowClick={config.onRowClick ? (row) => config.onRowClick!(row, router) : undefined}
            searchFn={config.searchFn}
            exportFilename={config.exportFilename}
            emptyIcon={config.icon}
            emptyTitle={config.emptyTitle}
            emptyDescription={config.emptyDescription}
            searchPlaceholder="Search…"
          />
        ) : config.type === 'cards' && config.cards ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {config.cards.map(c => (
              <div key={c.title} className="rounded-md border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">{c.title}</p>
                <p className="mt-1 text-2xl font-semibold tnum">{c.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.subtext}</p>
              </div>
            ))}
          </div>
        ) : (
          config.infoContent
        )}
      </div>
    </PageContainer>
  );
}
