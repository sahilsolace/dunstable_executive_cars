'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Flag, Wrench, CheckCircle2, Lock, History, ShieldCheck } from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/session-provider';
import { defectRepo, vehicleRepo, personRepo } from '@/lib/repos';
import { fmtReg, fmtDate, fmtDateTime } from '@/lib/format';
import { can } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DefectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { effectiveUser } = useSession();
  const id = params.id as string;
  if (!effectiveUser) return null;
  const defect = defectRepo.get(id);

  if (!defect) {
    return (
      <PageContainer>
        <div className="py-24 text-center">
          <p className="text-sm font-medium">Defect not found</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/defects')}>Back to defects</Button>
        </div>
      </PageContainer>
    );
  }

  const vehicle = vehicleRepo.get(defect.vehicleId);
  const reporter = personRepo.get(defect.reportedById);

  // Release-to-service gate: needs repair complete + independent verification + second authorised person
  const repairComplete = defect.status === 'repair_complete' || defect.status === 'verified' || defect.status === 'closed';
  const independentlyVerified = !!defect.verifiedBy;
  const canRelease = can(effectiveUser, 'release_to_service', 'defects');
  const canVerify = can(effectiveUser, 'verify_defect', 'defects');

  const releaseBlockers: string[] = [];
  if (!repairComplete) releaseBlockers.push('Repair is not yet complete');
  if (!independentlyVerified) releaseBlockers.push('Independent verification has not been carried out');
  if (defect.severity === 'critical' && !independentlyVerified) releaseBlockers.push('Critical defects require independent verification before release');

  const handleRelease = () => {
    if (releaseBlockers.length > 0) return;
    toast.success('Vehicle released to service', { description: `${defect.ref} released by ${effectiveUser.name}` });
  };

  const handleVerify = () => {
    toast.success('Defect independently verified', { description: `${defect.ref} verified by ${effectiveUser.name}` });
  };

  return (
    <PageContainer>
      <Link href="/defects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to defects
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex h-11 w-11 items-center justify-center rounded-md',
            defect.severity === 'critical' ? 'bg-bad-soft text-bad-fg' : defect.severity === 'major' ? 'bg-warn-soft text-warn-fg' : 'bg-muted text-muted-foreground'
          )}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold tnum">{defect.ref}</h1>
              <span className={cn('rounded border px-2 py-0.5 text-xs font-medium',
                defect.severity === 'critical' ? 'border-bad/30 bg-bad-soft text-bad-fg' :
                defect.severity === 'major' ? 'border-warn/30 bg-warn-soft text-warn-fg' :
                'border-border bg-muted text-muted-foreground'
              )}>{defect.severity}</span>
              <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs">{defect.status.replace(/_/g, ' ')}</span>
              {defect.blocksAllocation && <span className="rounded border border-bad/30 bg-bad-soft px-2 py-0.5 text-xs font-medium text-bad-fg">Blocks allocation</span>}
            </div>
            <p className="mt-1 text-sm text-foreground">{defect.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">Reported {fmtDate(defect.reportedAt)} by {reporter?.name ?? defect.reportedById}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-foreground">{defect.description}</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Vehicle</CardTitle></CardHeader>
            <CardContent>
              {vehicle ? (
                <Link href={`/fleet/vehicles/${vehicle.id}`} className="flex items-center gap-3 text-sm hover:text-brand">
                  <span className="font-medium tnum">{fmtReg(vehicle.registration)}</span>
                  <span className="text-muted-foreground">{vehicle.make} {vehicle.model}</span>
                </Link>
              ) : <p className="text-sm text-muted-foreground">Vehicle not found</p>}
              <p className="mt-1 text-xs text-muted-foreground">Component: {defect.component}</p>
            </CardContent>
          </Card>

          {/* Event history / timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Event history</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {defect.events.map((e, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      {i < defect.events.length - 1 && <span className="h-full w-px bg-border" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-medium">{e.action}</p>
                      {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
                      <p className="text-xs text-muted-foreground">{e.actor} · {fmtDateTime(e.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: release-to-service gate */}
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Release to service</h3>
            </div>

            <div className="mt-3 space-y-2">
              <GateRow label="Repair complete" done={repairComplete} />
              <GateRow label="Independent verification" done={independentlyVerified} />
              <GateRow label="Authorised person" done={canRelease} />
            </div>

            {releaseBlockers.length > 0 ? (
              <div className="mt-3 rounded border border-bad/20 bg-bad-soft/40 p-2">
                <p className="text-xs font-medium text-bad-fg">Cannot release yet:</p>
                <ul className="mt-1 space-y-0.5">
                  {releaseBlockers.map((b, i) => <li key={i} className="text-xs text-muted-foreground">• {b}</li>)}
                </ul>
              </div>
            ) : (
              <div className="mt-3 rounded border border-ok/20 bg-ok-soft/40 p-2">
                <p className="text-xs font-medium text-ok-fg">All blockers cleared. Ready for release.</p>
              </div>
            )}

            <Button
              size="sm"
              className="mt-3 w-full"
              disabled={releaseBlockers.length > 0 || !canRelease}
              onClick={handleRelease}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Release to service
            </Button>
            {!canRelease && releaseBlockers.length === 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground">Your role cannot release to service.</p>
            )}

            {/* Verify button (separate authorised person) */}
            {!independentlyVerified && repairComplete && canVerify && (
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleVerify}>
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Mark as independently verified
              </Button>
            )}
          </div>

          {defect.workshopJobId && (
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">Linked workshop job</p>
              <p className="mt-1 text-sm font-medium">{defect.workshopJobId}</p>
            </div>
          )}

          {defect.releasedToService && (
            <div className="rounded-md border border-ok/30 bg-ok-soft p-3">
              <p className="text-xs font-medium text-ok-fg">Released to service</p>
              <p className="mt-1 text-xs text-muted-foreground">By {defect.releasedBy} on {fmtDate(defect.releasedAt ?? '')}</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function GateRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {done ? <CheckCircle2 className="h-4 w-4 text-ok" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
      <span className={cn('text-xs', done ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
    </div>
  );
}
