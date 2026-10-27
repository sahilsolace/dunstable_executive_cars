'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Car, Users, AlertTriangle, FileText, Building2, ArrowRight } from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { StatusChip } from '@/components/status-chip';
import { vehicleRepo, personRepo, defectRepo, incidentRepo, companyRepo } from '@/lib/repos';
import { fmtReg, fmtDate } from '@/lib/format';
import { useSession } from '@/components/session-provider';
import { dbsVisibility } from '@/lib/permissions';
import { cn } from '@/lib/utils';

interface SearchHit {
  id: string;
  type: 'vehicle' | 'person' | 'defect' | 'incident' | 'company';
  title: string;
  subtitle: string;
  href: string;
  status?: string;
  icon: typeof Car;
}

export default function SearchPage() {
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const { effectiveUser } = useSession();

  const results: SearchHit[] = React.useMemo(() => {
    if (!q) return [];
    const needle = q.toLowerCase();
    const hits: SearchHit[] = [];

    for (const v of vehicleRepo.list()) {
      if (`${v.registration} ${v.make} ${v.model} ${v.statusReason}`.toLowerCase().includes(needle)) {
        hits.push({ id: v.id, type: 'vehicle', title: fmtReg(v.registration), subtitle: `${v.make} ${v.model} · ${v.year}`, href: `/fleet/vehicles/${v.id}`, status: v.status, icon: Car });
      }
    }

    const vis = effectiveUser ? dbsVisibility(effectiveUser.role) : 'none';
    for (const p of personRepo.list()) {
      const showDbs = vis !== 'none';
      const haystack = `${p.name} ${p.roles.join(' ')} ${showDbs ? p.dbsStatus : ''} ${p.drivingClearanceReason ?? ''} ${p.paClearanceReason ?? ''}`;
      if (haystack.toLowerCase().includes(needle)) {
        const role = p.roles.includes('dual') ? 'Driver / PA' : p.roles.includes('driver') ? 'Driver' : 'Passenger Assistant';
        hits.push({ id: p.id, type: 'person', title: p.name, subtitle: role, href: p.roles.includes('driver') ? `/people/drivers/${p.id}` : `/people/pas/${p.id}`, icon: Users });
      }
    }

    for (const d of defectRepo.list()) {
      const veh = vehicleRepo.get(d.vehicleId);
      if (`${d.ref} ${d.title} ${d.description} ${veh?.registration ?? ''} ${d.component}`.toLowerCase().includes(needle)) {
        hits.push({ id: d.id, type: 'defect', title: d.ref, subtitle: `${d.title} · ${veh ? fmtReg(veh.registration) : d.vehicleId}`, href: `/defects/${d.id}`, status: d.severity === 'critical' ? 'blocked' : d.severity === 'major' ? 'due_soon' : 'ready', icon: AlertTriangle });
      }
    }

    for (const i of incidentRepo.list()) {
      if (`${i.ref} ${i.description} ${i.type} ${i.severity}`.toLowerCase().includes(needle)) {
        hits.push({ id: i.id, type: 'incident', title: i.ref, subtitle: `${i.type.replace(/_/g, ' ')} · ${fmtDate(i.date)}`, href: '/operations/incidents', icon: FileText });
      }
    }

    for (const c of companyRepo.list()) {
      if (`${c.tradingName} ${c.legalName}`.toLowerCase().includes(needle)) {
        hits.push({ id: c.id, type: 'company', title: c.tradingName, subtitle: c.legalName, href: '/admin/companies', icon: Building2 });
      }
    }

    return hits;
  }, [q, effectiveUser]);

  const grouped = React.useMemo(() => {
    const g: Record<string, SearchHit[]> = {};
    for (const h of results) {
      (g[h.type] ??= []).push(h);
    }
    return g;
  }, [results]);

  const typeLabels: Record<string, string> = {
    vehicle: 'Vehicles',
    person: 'People',
    defect: 'Defects',
    incident: 'Incidents',
    company: 'Companies',
  };

  return (
    <PageContainer>
      <div className="py-6">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">
            {q ? `Search results for "${q}"` : 'Search'}
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {q ? `${results.length} result${results.length !== 1 ? 's' : ''} across vehicles, people, defects, incidents and companies.` : 'Type in the search bar above to find vehicles, drivers, defects and more.'}
        </p>

        {q && results.length === 0 && (
          <div className="mt-12 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">No results found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a registration, name, defect reference or keyword.</p>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {Object.entries(grouped).map(([type, hits]) => (
            <div key={type}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {typeLabels[type] ?? type} · {hits.length}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {hits.map(h => {
                  const Icon = h.icon;
                  return (
                    <Link
                      key={`${h.type}-${h.id}`}
                      href={h.href}
                      className="group flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:border-brand/40 hover:bg-muted/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{h.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{h.subtitle}</p>
                      </div>
                      {h.status && <StatusChip status={h.status as any} size="xs" />}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-brand" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
