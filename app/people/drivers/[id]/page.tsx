'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, ShieldCheck, GraduationCap, FileText, Car } from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { StatusChip } from '@/components/status-chip';
import { DueDateBadge } from '@/components/due-date-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/session-provider';
import { personRepo, vehicleRepo } from '@/lib/repos';
import { fmtDate, fmtDateTime } from '@/lib/format';
import { daysUntil } from '@/lib/rules';
import { dbsVisibility } from '@/lib/permissions';
import type { TrainingRecord } from '@/lib/types';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { effectiveUser } = useSession();
  const id = params.id as string;
  if (!effectiveUser) return null;
  const person = personRepo.get(id);

  if (!person) {
    return (
      <PageContainer>
        <div className="py-24 text-center">
          <p className="text-sm font-medium">Person not found</p>
        </div>
      </PageContainer>
    );
  }

  const isDriver = person.roles.includes('driver') || person.roles.includes('dual');
  const isPA = person.roles.includes('passenger_assistant') || person.roles.includes('dual');
  const dbsVis = dbsVisibility(effectiveUser.role);
  const assignedVehicle = vehicleRepo.list({ companyId: person.companyId }).find(v => v.assignedDriverId === person.id || v.assignedPaId === person.id);

  return (
    <PageContainer>
      <Link href={isDriver ? '/people/drivers' : '/people/pas'} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {isDriver ? 'drivers' : 'passenger assistants'}
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm font-semibold">
            {person.initials}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{person.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{person.roles.map(r => r === 'passenger_assistant' ? 'Passenger assistant' : r === 'dual' ? 'Driver / PA (dual role)' : 'Driver').join(', ')}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isDriver && <ClearanceChip label="Driving" status={person.drivingClearance} />}
              {isPA && <ClearanceChip label="PA duties" status={person.paClearance} />}
              <ClearanceChip label="Specialist" status={person.specialistClearance} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isDriver && <TabsTrigger value="licence">Licence</TabsTrigger>}
            <TabsTrigger value="dbs">DBS</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Contact" value={person.contact} />
              <Field label="Roles" value={person.roles.join(', ')} />
              <Field label="DBS ID" value={person.dbsId} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {isDriver && <ClearanceCard label="Driving clearance" reason={person.drivingClearanceReason} status={person.drivingClearance} />}
              {isPA && <ClearanceCard label="PA clearance" reason={person.paClearanceReason} status={person.paClearance} />}
              <ClearanceCard label="Specialist clearance" reason={person.specialistClearance === 'ready' ? 'No specialist restrictions' : 'Specialist review needed'} status={person.specialistClearance} />
            </div>
          </TabsContent>

          {isDriver && (
            <TabsContent value="licence" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Driving licence</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="Licence number" value={person.drivingLicenceNumber ?? '—'} />
                    <Field label="Licence expiry" value={<DueDateBadge date={person.licenceExpiry} />} />
                    <Field label="Last check" value={fmtDate(person.licenceCheckLast)} />
                    <Field label="Next check" value={<DueDateBadge date={person.licenceCheckNext} />} />
                    <Field label="Check provider" value={person.licenceCheckProvider ?? '—'} />
                    <Field label="Declaration valid" value={person.licenceCheckNext ? (daysUntil(person.licenceCheckNext) >= 0 ? 'Yes' : 'Expired') : '—'} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> Provider status: Simulated (DVLA ADD not live). Change alerts would appear here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!isDriver && (
            <TabsContent value="licence" className="mt-4">
              <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                This person is a passenger assistant only — no driving licence is required.
              </div>
            </TabsContent>
          )}

          <TabsContent value="dbs" className="mt-4 space-y-4">
            {dbsVis === 'none' ? (
              <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                You do not have access to DBS information for this person.
              </div>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> DBS review
                    {dbsVis === 'summary' && <span className="text-xs font-normal text-muted-foreground">(summary only)</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="DBS status" value={<StatusChip status={person.dbsStatus} />} />
                    <Field label="DBS ID" value={person.dbsId} />
                    <Field label="Last review" value={fmtDate(person.dbsLastReview)} />
                    <Field label="Next review" value={<DueDateBadge date={person.dbsNextReview} />} />
                  </div>
                  {dbsVis === 'summary' && (
                    <div className="mt-3 rounded border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                      As a controller, you can see the status (Cleared / Pending / Restricted) and next review date only. Certificate details are restricted to HR and owners.
                    </div>
                  )}
                  {dbsVis === 'full' && (
                    <div className="mt-3 rounded border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                      Full metadata visible. No certificate images are stored in this system. View of this data has been recorded in the audit log.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="training" className="mt-4">
            {person.training.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No training records on file.
              </div>
            ) : (
              <div className="space-y-2">
                {person.training.map((t: TrainingRecord) => (
                  <div key={t.id} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                    <div>
                      <p className="text-sm font-medium">{t.course}</p>
                      <p className="text-xs text-muted-foreground">Completed {fmtDate(t.completedAt)} · Verifier: {t.verifier}</p>
                    </div>
                    <div className="text-right">
                      {t.expiresAt ? <DueDateBadge date={t.expiresAt} /> : <span className="text-xs text-muted-foreground">No expiry</span>}
                      {t.verified && <p className="mt-0.5 text-xs text-ok-fg">Verified</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Training renewal intervals are set by operator policy. No statutory interval is assumed for PAT or MiDAS.</p>
          </TabsContent>

          <TabsContent value="assignment" className="mt-4">
            {assignedVehicle ? (
              <Link href={`/fleet/vehicles/${assignedVehicle.id}`} className="flex items-center gap-3 rounded-md border border-border bg-card p-3 hover:bg-muted/40">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium tnum">{assignedVehicle.registration}</p>
                  <p className="text-xs text-muted-foreground">{assignedVehicle.make} {assignedVehicle.model}</p>
                </div>
              </Link>
            ) : (
              <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Not currently assigned to a vehicle.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-sm">{value}</p></div>;
}

function ClearanceChip({ label, status }: { label: string; status: any }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <StatusChip status={status} size="xs" />
    </span>
  );
}

function ClearanceCard({ label, reason, status }: { label: string; reason: string; status: any }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <StatusChip status={status} size="xs" />
      </div>
      <p className="mt-1.5 text-xs text-foreground">{reason}</p>
    </div>
  );
}
