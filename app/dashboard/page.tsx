'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Car, AlertTriangle, ClipboardCheck, Gauge, ShieldCheck, FileText,
  GraduationCap, ArrowRight, Clock, XCircle, AlertCircle,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { StatusChip } from '@/components/status-chip';
import { DueDateBadge } from '@/components/due-date-badge';
import { useSession } from '@/components/session-provider';
import { vehicleRepo, defectRepo, personRepo, checkRepo, companyRepo } from '@/lib/repos';
import { fmtDate, fmtReg, fmtMiles } from '@/lib/format';
import { daysUntil } from '@/lib/rules';
import type { Vehicle, Defect } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CardConfig {
  title: string;
  count: string;
  subtext: string;
  icon: React.ElementType;
  tone: 'ok' | 'warn' | 'bad' | 'pending';
  link: string;
  linkLabel: string;
}

export default function DashboardPage() {
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;
  const cid = effectiveUser.companyId;

  const vehicles = vehicleRepo.list({ companyId: cid });
  const defects = defectRepo.list({ companyId: cid });
  const drivers = personRepo.list({ companyId: cid, role: 'driver' });
  const pas = personRepo.list({ companyId: cid, role: 'pa' });
  const checks = checkRepo.list();

  const offRoad = vehicles.filter(v => v.offRoad || v.status === 'blocked');
  const available = vehicles.filter(v => !v.offRoad && v.status === 'ready');
  const criticalDefects = defects.filter(d => d.severity === 'critical' && d.status !== 'closed' && d.status !== 'verified');
  const missingChecks = vehicles.filter(v => {
    const todayStart = '2026-10-27T00:00:00Z';
    return !checks.some(c => c.vehicleId === v.id && c.submittedAt >= todayStart);
  });
  const testsDue = vehicles.filter(v => {
    const motDays = daysUntil(v.motExpiry);
    const councilDays = daysUntil(v.councilSixMonthDue);
    return motDays <= 31 || councilDays <= 31;
  });
  const overdueService = vehicles.filter(v => {
    if (!v.nextServiceDate && !v.nextServiceMileage) return false;
    const dateDue = v.nextServiceDate ? daysUntil(v.nextServiceDate) <= 0 : false;
    const mileageDue = v.nextServiceMileage ? v.currentMileage >= v.nextServiceMileage : false;
    return dateDue || mileageDue;
  });
  const clearanceIssues = [...drivers, ...pas].filter(p =>
    p.drivingClearance === 'blocked' || p.drivingClearance === 'verification_pending' ||
    p.paClearance === 'blocked' || p.paClearance === 'verification_pending' ||
    p.dbsStatus === 'blocked' || p.dbsStatus === 'verification_pending'
  );
  const expiredDocs = vehicles.filter(v => {
    const ins = v.insuranceExpiry ? daysUntil(v.insuranceExpiry) <= 31 : false;
    const pco = v.pcoLicenceExpiry ? daysUntil(v.pcoLicenceExpiry) <= 31 : false;
    return ins || pco;
  });
  const trainingReviews = [...drivers, ...pas].filter(p =>
    p.training.some(t => t.expiresAt && daysUntil(t.expiresAt) <= 90)
  );

  const cards: CardConfig[] = [
    { title: 'Available vehicles', count: `${available.length}`, subtext: `${offRoad.length} off-road or blocked`, icon: Car, tone: available.length > vehicles.length / 2 ? 'ok' : 'warn', link: '/fleet/vehicles', linkLabel: 'View fleet' },
    { title: 'Missing checks today', count: `${missingChecks.length}`, subtext: `${vehicles.length - missingChecks.length} submitted`, icon: ClipboardCheck, tone: missingChecks.length > 0 ? 'warn' : 'ok', link: '/checks/daily', linkLabel: 'View checks' },
    { title: 'Critical defects', count: `${criticalDefects.length}`, subtext: 'Awaiting repair or verification', icon: AlertTriangle, tone: criticalDefects.length > 0 ? 'bad' : 'ok', link: '/defects', linkLabel: 'View defects' },
    { title: 'Tests due (31 days)', count: `${testsDue.length}`, subtext: 'MOT and/or council six-month', icon: FileText, tone: testsDue.length > 0 ? 'warn' : 'ok', link: '/fleet/vehicles', linkLabel: 'View vehicles' },
    { title: 'Overdue servicing', count: `${overdueService.length}`, subtext: 'Date or mileage trigger', icon: Gauge, tone: overdueService.length > 0 ? 'warn' : 'ok', link: '/maintenance/services', linkLabel: 'View schedules' },
    { title: 'Clearance issues', count: `${clearanceIssues.length}`, subtext: 'Driving, PA or DBS', icon: ShieldCheck, tone: clearanceIssues.length > 0 ? 'bad' : 'ok', link: '/people/drivers', linkLabel: 'View people' },
    { title: 'Expired documents', count: `${expiredDocs.length}`, subtext: 'Insurance or PCO licence', icon: FileText, tone: expiredDocs.length > 0 ? 'warn' : 'ok', link: '/fleet/vehicles', linkLabel: 'View vehicles' },
    { title: 'Training reviews', count: `${trainingReviews.length}`, subtext: 'Expiring within 90 days', icon: GraduationCap, tone: trainingReviews.length > 0 ? 'warn' : 'ok', link: '/people/training', linkLabel: 'View training' },
  ];

  // Needs action today — ordered by risk
  const actions: { severity: 'critical' | 'warning' | 'info'; title: string; detail: string; link: string }[] = [];

  for (const v of vehicles.filter(v => v.status === 'blocked')) {
    actions.push({ severity: 'critical', title: `${fmtReg(v.registration)} — blocked`, detail: v.statusReason, link: `/fleet/vehicles/${v.id}` });
  }
  for (const d of criticalDefects) {
    const veh = vehicleRepo.get(d.vehicleId);
    actions.push({ severity: 'critical', title: `${d.ref} — critical defect`, detail: `${veh ? fmtReg(veh.registration) : ''}: ${d.title}`, link: `/defects/${d.id}` });
  }
  for (const v of missingChecks) {
    actions.push({ severity: 'warning', title: `${fmtReg(v.registration)} — no check today`, detail: 'Daily walkaround check not submitted', link: '/checks/daily' });
  }
  for (const v of testsDue.filter(v => daysUntil(v.motExpiry) < 0 || daysUntil(v.councilSixMonthDue) < 0)) {
    actions.push({ severity: 'warning', title: `${fmtReg(v.registration)} — test overdue`, detail: 'MOT or council six-month check past due', link: `/fleet/vehicles/${v.id}` });
  }
  for (const p of clearanceIssues.filter(p => p.drivingClearance === 'blocked' || p.paClearance === 'blocked')) {
    actions.push({ severity: 'warning', title: `${p.name} — clearance blocked`, detail: p.drivingClearance === 'blocked' ? p.drivingClearanceReason : p.paClearanceReason, link: p.roles.includes('driver') ? `/people/drivers/${p.id}` : `/people/pas/${p.id}` });
  }

  const sortedActions = actions.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`Overview for ${companyRepo.get(cid)?.tradingName ?? 'this company'} — ${fmtDate('2026-10-27T00:00:00Z')}`}
      />

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <Link
            key={card.title}
            href={card.link}
            className="group flex flex-col rounded-md border border-border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold tnum">{card.count}</p>
              </div>
              <span className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                card.tone === 'ok' && 'bg-ok-soft text-ok-fg',
                card.tone === 'warn' && 'bg-warn-soft text-warn-fg',
                card.tone === 'bad' && 'bg-bad-soft text-bad-fg',
                card.tone === 'pending' && 'bg-pending-soft text-pending-fg',
              )}>
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{card.subtext}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand">
              {card.linkLabel}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Needs action today */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Needs action today</h2>
        <p className="text-xs text-muted-foreground">Ordered by risk — critical items first</p>
        <div className="mt-3 space-y-2">
          {sortedActions.length === 0 ? (
            <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No actions required today.
            </div>
          ) : (
            sortedActions.slice(0, 12).map((a, i) => (
              <Link
                key={i}
                href={a.link}
                className="flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted/40"
              >
                <span className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded',
                  a.severity === 'critical' && 'bg-bad-soft text-bad-fg',
                  a.severity === 'warning' && 'bg-warn-soft text-warn-fg',
                  a.severity === 'info' && 'bg-pending-soft text-pending-fg',
                )}>
                  {a.severity === 'critical' ? <XCircle className="h-3.5 w-3.5" /> :
                   a.severity === 'warning' ? <AlertCircle className="h-3.5 w-3.5" /> :
                   <Clock className="h-3.5 w-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
