'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { StatusChip } from '@/components/status-chip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/session-provider';
import { personRepo, vehicleRepo } from '@/lib/repos';
import { fmtDate } from '@/lib/format';
import { dbsVisibility } from '@/lib/permissions';

export default function PADetailPage() {
  const params = useParams();
  const router = useRouter();
  const { effectiveUser } = useSession();
  const id = params.id as string;
  if (!effectiveUser) return null;
  const person = personRepo.get(id);

  if (!person) {
    return <PageContainer><div className="py-24 text-center text-sm">Person not found</div></PageContainer>;
  }

  const dbsVis = dbsVisibility(effectiveUser.role);
  const assignedVehicle = vehicleRepo.list({ companyId: person.companyId }).find(v => v.assignedPaId === person.id);

  return (
    <PageContainer>
      <Link href="/people/pas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to passenger assistants
      </Link>
      <div className="mt-3 flex flex-wrap items-start gap-4 border-b border-border pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm font-semibold">
          {person.initials}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{person.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Passenger assistant {person.roles.includes('dual') ? '/ Driver (dual role)' : ''}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5"><span className="text-xs text-muted-foreground">PA duties:</span><StatusChip status={person.paClearance} size="xs" /></span>
            <span className="inline-flex items-center gap-1.5"><span className="text-xs text-muted-foreground">Specialist:</span><StatusChip status={person.specialistClearance} size="xs" /></span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dbs">DBS</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Contact" value={person.contact} />
              <Field label="Roles" value={person.roles.join(', ')} />
              <Field label="DBS ID" value={person.dbsId} />
            </div>
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              This person is a passenger assistant. No driving licence is required or tracked.
            </div>
          </TabsContent>

          <TabsContent value="dbs" className="mt-4">
            {dbsVis === 'none' ? (
              <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                You do not have access to DBS information for this person.
              </div>
            ) : (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">DBS review</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="DBS status" value={<StatusChip status={person.dbsStatus} />} />
                    <Field label="DBS ID" value={person.dbsId} />
                    <Field label="Last review" value={fmtDate(person.dbsLastReview)} />
                    <Field label="Next review" value={fmtDate(person.dbsNextReview)} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="training" className="mt-4">
            {person.training.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">No training records on file.</div>
            ) : (
              <div className="space-y-2">
                {person.training.map(t => (
                  <div key={t.id} className="rounded-md border border-border bg-card p-3">
                    <p className="text-sm font-medium">{t.course}</p>
                    <p className="text-xs text-muted-foreground">Completed {fmtDate(t.completedAt)} · Verifier: {t.verifier}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignment" className="mt-4">
            {assignedVehicle ? (
              <Link href={`/fleet/vehicles/${assignedVehicle.id}`} className="rounded-md border border-border bg-card p-3 block hover:bg-muted/40">
                <p className="text-sm font-medium tnum">{assignedVehicle.registration}</p>
                <p className="text-xs text-muted-foreground">{assignedVehicle.make} {assignedVehicle.model}</p>
              </Link>
            ) : <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Not currently assigned.</div>}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-sm">{value}</p></div>;
}
