import type { Role, User } from './types';

// Resource/field-level permission engine. Single source of truth.
// Used by routes, tables, exports and file links.

export type Action =
  | 'view' | 'create' | 'edit' | 'delete' | 'export'
  | 'view_restricted' | 'view_dbs_detail' | 'view_dbs_summary'
  | 'release_to_service' | 'verify_defect' | 'manage_companies'
  | 'manage_users' | 'manage_rules' | 'manage_integrations'
  | 'view_audit' | 'view_dbs_certificate';

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  company_manager: 'Company manager',
  controller: 'Controller',
  driver_pa: 'Driver / PA',
  mechanic: 'Mechanic / Garage',
  hr_vetting: 'HR / Vetting / Safeguarding',
  auditor: 'Auditor / Support',
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

// permission matrix: role -> actions
const MATRIX: Record<Role, Action[]> = {
  owner: [
    'view', 'create', 'edit', 'delete', 'export',
    'view_restricted', 'view_dbs_detail', 'view_dbs_summary',
    'release_to_service', 'verify_defect',
    'manage_companies', 'manage_users', 'manage_rules', 'manage_integrations',
    'view_audit',
  ],
  company_manager: [
    'view', 'create', 'edit', 'export',
    'view_dbs_summary',
    'release_to_service', 'verify_defect',
    'manage_users',
    'view_audit',
  ],
  controller: [
    'view', 'export',
    'view_dbs_summary',
  ],
  driver_pa: ['view'],
  mechanic: ['view', 'edit', 'verify_defect'],
  hr_vetting: [
    'view', 'view_restricted', 'view_dbs_detail', 'view_dbs_summary', 'edit',
    'view_audit',
  ],
  auditor: ['view', 'export', 'view_audit'],
};

// Resources that are entirely restricted to certain roles
const RESTRICTED_RESOURCES: Record<string, Role[]> = {
  'assurance.dbs': ['owner', 'hr_vetting'],
  'assurance.licences': ['owner', 'company_manager', 'hr_vetting'],
  'assurance.safeguarding': ['owner', 'hr_vetting'],
  'admin.audit': ['owner', 'auditor', 'hr_vetting'],
};

export function can(
  user: User,
  action: Action,
  resource: string,
  field?: string
): boolean {
  // DBS detail/summary checks must run before the restricted-resource gate,
  // because controller and manager are allowed summary access to assurance.dbs
  // even though the resource itself is restricted to owner/HR for full detail.
  if (resource === 'assurance.dbs' && action === 'view_dbs_summary') {
    return ['owner', 'company_manager', 'controller', 'hr_vetting'].includes(user.role);
  }
  if (resource === 'assurance.dbs' && action === 'view_dbs_detail') {
    return user.role === 'owner' || user.role === 'hr_vetting';
  }

  // restricted resource gate
  const allowedRoles = RESTRICTED_RESOURCES[resource];
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return false;
  }

  // release to service needs a second authorised person (owner/manager/mechanic verified)
  if (action === 'release_to_service') {
    return ['owner', 'company_manager'].includes(user.role);
  }
  if (action === 'verify_defect') {
    return ['owner', 'company_manager', 'mechanic'].includes(user.role);
  }

  const actions = MATRIX[user.role] || [];
  return actions.includes(action);
}

// What a role can see of DBS data
export function dbsVisibility(role: Role): 'full' | 'summary' | 'none' {
  if (role === 'owner' || role === 'hr_vetting') return 'full';
  if (role === 'company_manager' || role === 'controller') return 'summary';
  return 'none';
}

export function canAccessRoute(user: User, route: string): boolean {
  const gate: Record<string, Action> = {
    '/assurance/licences': 'view_dbs_summary',
    '/assurance/dbs': 'view_dbs_summary',
    '/assurance/safeguarding': 'view_restricted',
    '/admin/companies': 'manage_companies',
    '/admin/users': 'manage_users',
    '/admin/rules': 'manage_rules',
    '/admin/integrations': 'manage_integrations',
    '/admin/audit': 'view_audit',
    '/admin/settings': 'manage_companies',
  };
  const required = gate[route];
  if (!required) return can(user, 'view', route);
  return can(user, required, route);
}

export const DEMO_USERS: Record<Role, User> = {
  owner: {
    id: 'u-owner', name: 'Sarah Whitfield', email: 'sarah@dec-fleet.co.uk',
    role: 'owner', companyId: 'c-dec', depotId: 'd-dunstable',
    initials: 'SW',
  },
  company_manager: {
    id: 'u-manager', name: 'James Okoro', email: 'james@dec-fleet.co.uk',
    role: 'company_manager', companyId: 'c-dec', depotId: 'd-dunstable',
    initials: 'JO',
  },
  controller: {
    id: 'u-controller', name: 'Priya Patel', email: 'priya@dec-fleet.co.uk',
    role: 'controller', companyId: 'c-dec', depotId: 'd-luton',
    initials: 'PP',
  },
  driver_pa: {
    id: 'u-driver', name: 'Mark Davies', email: 'mark@dec-fleet.co.uk',
    role: 'driver_pa', companyId: 'c-dec', depotId: 'd-dunstable',
    initials: 'MD',
  },
  mechanic: {
    id: 'u-mechanic', name: 'Tom Bridger', email: 'tom@dec-fleet.co.uk',
    role: 'mechanic', companyId: 'c-dec', depotId: 'd-dunstable',
    initials: 'TB',
  },
  hr_vetting: {
    id: 'u-hr', name: 'Anita Sharma', email: 'anita@dec-fleet.co.uk',
    role: 'hr_vetting', companyId: 'c-dec', depotId: 'd-dunstable',
    initials: 'AS',
  },
  auditor: {
    id: 'u-auditor', name: 'External Audit', email: 'audit@dec-fleet.co.uk',
    role: 'auditor', companyId: 'c-dec', initials: 'EA',
  },
};
