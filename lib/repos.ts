import type {
  Vehicle, Person, Defect, CheckSubmission, ChecklistTemplate,
  Company, Depot, ServiceSchedule, WorkshopJob, CostEntry, Incident,
  Integration, RuleEntry, AuditEntry, Notification, GreyFleetEntry,
} from './types';
import * as db from './db';

// Repository interface — swap the mock for a real API by replacing these
// implementations with fetch calls. The component layer never imports db.ts
// directly; it always goes through these repos.

export interface VehicleRepo {
  list(filter?: { companyId?: string; depotId?: string; status?: string }): Vehicle[];
  get(id: string): Vehicle | undefined;
  byRegistration(reg: string): Vehicle | undefined;
}
export interface PersonRepo {
  list(filter?: { companyId?: string; depotId?: string; role?: string }): Person[];
  get(id: string): Person | undefined;
}
export interface DefectRepo {
  list(filter?: { companyId?: string; status?: string; vehicleId?: string }): Defect[];
  get(id: string): Defect | undefined;
}
export interface CheckRepo {
  list(filter?: { vehicleId?: string; offline?: boolean }): CheckSubmission[];
  get(id: string): CheckSubmission | undefined;
}
export interface TemplateRepo {
  list(filter?: { active?: boolean }): ChecklistTemplate[];
  get(versionId: string): ChecklistTemplate | undefined;
}
export interface CompanyRepo {
  list(): Company[];
  get(id: string): Company | undefined;
  depots(companyId?: string): Depot[];
}
export interface ServiceRepo {
  list(vehicleId?: string): ServiceSchedule[];
  get(vehicleId: string): ServiceSchedule | undefined;
}
export interface WorkshopRepo {
  list(): WorkshopJob[];
  get(id: string): WorkshopJob | undefined;
}
export interface CostRepo {
  list(filter?: { vehicleId?: string }): CostEntry[];
}
export interface IncidentRepo {
  list(): Incident[];
  get(id: string): Incident | undefined;
}
export interface IntegrationRepo {
  list(): Integration[];
}
export interface RuleRepo {
  list(): RuleEntry[];
}
export interface AuditRepo {
  list(filter?: { restricted?: boolean }): AuditEntry[];
}
export interface NotificationRepo {
  list(): Notification[];
}
export interface GreyFleetRepo {
  list(): GreyFleetEntry[];
}

function matchCompany<T extends { companyId: string }>(items: T[], companyId?: string) {
  return companyId ? items.filter(i => i.companyId === companyId) : items;
}

export const vehicleRepo: VehicleRepo = {
  list: (f) => {
    let r = matchCompany(db.vehicles, f?.companyId);
    if (f?.depotId) r = r.filter(v => v.depotId === f.depotId);
    if (f?.status) r = r.filter(v => v.status === f.status);
    return r;
  },
  get: (id) => db.vehicles.find(v => v.id === id),
  byRegistration: (reg) => db.vehicles.find(v => v.registration.toLowerCase() === reg.toLowerCase()),
};

export const personRepo: PersonRepo = {
  list: (f) => {
    let r = matchCompany(db.people, f?.companyId);
    if (f?.depotId) r = r.filter(p => p.depotId === f.depotId);
    if (f?.role === 'driver') r = r.filter(p => p.roles.includes('driver') || p.roles.includes('dual'));
    if (f?.role === 'pa') r = r.filter(p => p.roles.includes('passenger_assistant') || p.roles.includes('dual'));
    return r;
  },
  get: (id) => db.people.find(p => p.id === id),
};

export const defectRepo: DefectRepo = {
  list: (f) => {
    let r = db.defects;
    if (f?.companyId) r = r.filter(d => {
      const veh = db.vehicles.find(v => v.id === d.vehicleId);
      return veh?.companyId === f.companyId;
    });
    if (f?.status) r = r.filter(d => d.status === f.status);
    if (f?.vehicleId) r = r.filter(d => d.vehicleId === f.vehicleId);
    return r;
  },
  get: (id) => db.defects.find(d => d.id === id),
};

export const checkRepo: CheckRepo = {
  list: (f) => {
    let r = db.checkSubmissions;
    if (f?.vehicleId) r = r.filter(c => c.vehicleId === f.vehicleId);
    if (f?.offline !== undefined) r = r.filter(c => c.offline === f.offline);
    return r;
  },
  get: (id) => db.checkSubmissions.find(c => c.id === id),
};

export const templateRepo: TemplateRepo = {
  list: (f) => f?.active !== undefined ? db.checklistTemplates.filter(t => t.active === f.active) : db.checklistTemplates,
  get: (versionId) => db.checklistTemplates.find(t => t.versionId === versionId),
};

export const companyRepo: CompanyRepo = {
  list: () => db.companies,
  get: (id) => db.companies.find(c => c.id === id),
  depots: (companyId) => companyId ? db.depots.filter(d => d.companyId === companyId) : db.depots,
};

export const serviceRepo: ServiceRepo = {
  list: (vid) => vid ? db.serviceSchedules.filter(s => s.vehicleId === vid) : db.serviceSchedules,
  get: (vid) => db.serviceSchedules.find(s => s.vehicleId === vid),
};

export const workshopRepo: WorkshopRepo = {
  list: () => db.workshopJobs,
  get: (id) => db.workshopJobs.find(w => w.id === id),
};

export const costRepo: CostRepo = {
  list: (f) => f?.vehicleId ? db.costEntries.filter(c => c.vehicleId === f.vehicleId) : db.costEntries,
};

export const incidentRepo: IncidentRepo = {
  list: () => db.incidents,
  get: (id) => db.incidents.find(i => i.id === id),
};

export const integrationRepo: IntegrationRepo = {
  list: () => db.integrations,
};

export const ruleRepo: RuleRepo = {
  list: () => db.rules,
};

export const auditRepo: AuditRepo = {
  list: (f) => f?.restricted !== undefined ? db.auditEntries.filter(a => a.restricted === f.restricted) : db.auditEntries,
};

export const notificationRepo: NotificationRepo = {
  list: () => db.notifications,
};

export const greyFleetRepo: GreyFleetRepo = {
  list: () => db.greyFleet,
};
