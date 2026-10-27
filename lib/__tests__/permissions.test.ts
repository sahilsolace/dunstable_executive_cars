import { describe, it, expect } from 'vitest';
import { can, dbsVisibility, canAccessRoute, DEMO_USERS, roleLabel } from '../permissions';
import type { User, Role } from '../types';

function userFor(role: Role): User {
  return DEMO_USERS[role];
}

const ALL_ROLES: Role[] = ['owner', 'company_manager', 'controller', 'driver_pa', 'mechanic', 'hr_vetting', 'auditor'];

describe('can() — basic view access', () => {
  it('all roles can view non-restricted resources', () => {
    for (const role of ALL_ROLES) {
      expect(can(userFor(role), 'view', 'fleet.vehicles')).toBe(true);
    }
  });

  it('owner can do everything', () => {
    expect(can(userFor('owner'), 'create', 'fleet.vehicles')).toBe(true);
    expect(can(userFor('owner'), 'delete', 'fleet.vehicles')).toBe(true);
    expect(can(userFor('owner'), 'export', 'fleet.vehicles')).toBe(true);
  });

  it('controller cannot create or edit', () => {
    expect(can(userFor('controller'), 'create', 'fleet.vehicles')).toBe(false);
    expect(can(userFor('controller'), 'edit', 'fleet.vehicles')).toBe(false);
  });

  it('driver_pa can only view', () => {
    expect(can(userFor('driver_pa'), 'view', 'fleet.vehicles')).toBe(true);
    expect(can(userFor('driver_pa'), 'edit', 'fleet.vehicles')).toBe(false);
    expect(can(userFor('driver_pa'), 'create', 'fleet.vehicles')).toBe(false);
    expect(can(userFor('driver_pa'), 'export', 'fleet.vehicles')).toBe(false);
  });

  it('mechanic can view and edit but not create or delete', () => {
    expect(can(userFor('mechanic'), 'view', 'fleet.vehicles')).toBe(true);
    expect(can(userFor('mechanic'), 'edit', 'fleet.vehicles')).toBe(true);
    expect(can(userFor('mechanic'), 'create', 'fleet.vehicles')).toBe(false);
    expect(can(userFor('mechanic'), 'delete', 'fleet.vehicles')).toBe(false);
  });
});

describe('can() — restricted resources', () => {
  it('owner can view DBS detail', () => {
    expect(can(userFor('owner'), 'view_dbs_detail', 'assurance.dbs')).toBe(true);
  });

  it('HR can view DBS detail', () => {
    expect(can(userFor('hr_vetting'), 'view_dbs_detail', 'assurance.dbs')).toBe(true);
  });

  it('controller cannot view DBS detail', () => {
    expect(can(userFor('controller'), 'view_dbs_detail', 'assurance.dbs')).toBe(false);
  });

  it('manager cannot view DBS detail', () => {
    expect(can(userFor('company_manager'), 'view_dbs_detail', 'assurance.dbs')).toBe(false);
  });

  it('controller can view DBS summary', () => {
    expect(can(userFor('controller'), 'view_dbs_summary', 'assurance.dbs')).toBe(true);
  });

  it('manager can view DBS summary', () => {
    expect(can(userFor('company_manager'), 'view_dbs_summary', 'assurance.dbs')).toBe(true);
  });

  it('driver_pa cannot view DBS summary', () => {
    expect(can(userFor('driver_pa'), 'view_dbs_summary', 'assurance.dbs')).toBe(false);
  });

  it('safeguarding restricted to owner and HR', () => {
    expect(can(userFor('owner'), 'view', 'assurance.safeguarding')).toBe(true);
    expect(can(userFor('hr_vetting'), 'view', 'assurance.safeguarding')).toBe(true);
    expect(can(userFor('controller'), 'view', 'assurance.safeguarding')).toBe(false);
    expect(can(userFor('mechanic'), 'view', 'assurance.safeguarding')).toBe(false);
  });

  it('licences restricted to owner, manager, HR', () => {
    expect(can(userFor('owner'), 'view', 'assurance.licences')).toBe(true);
    expect(can(userFor('company_manager'), 'view', 'assurance.licences')).toBe(true);
    expect(can(userFor('hr_vetting'), 'view', 'assurance.licences')).toBe(true);
    expect(can(userFor('controller'), 'view', 'assurance.licences')).toBe(false);
    expect(can(userFor('mechanic'), 'view', 'assurance.licences')).toBe(false);
  });

  it('audit restricted to owner, auditor, HR', () => {
    expect(can(userFor('owner'), 'view', 'admin.audit')).toBe(true);
    expect(can(userFor('auditor'), 'view', 'admin.audit')).toBe(true);
    expect(can(userFor('hr_vetting'), 'view', 'admin.audit')).toBe(true);
    expect(can(userFor('company_manager'), 'view', 'admin.audit')).toBe(false);
  });
});

describe('can() — release to service', () => {
  it('owner can release to service', () => {
    expect(can(userFor('owner'), 'release_to_service', 'defects')).toBe(true);
  });

  it('manager can release to service', () => {
    expect(can(userFor('company_manager'), 'release_to_service', 'defects')).toBe(true);
  });

  it('mechanic cannot release to service (independent verification)', () => {
    expect(can(userFor('mechanic'), 'release_to_service', 'defects')).toBe(false);
  });

  it('mechanic can verify defects', () => {
    expect(can(userFor('mechanic'), 'verify_defect', 'defects')).toBe(true);
  });

  it('controller cannot release or verify', () => {
    expect(can(userFor('controller'), 'release_to_service', 'defects')).toBe(false);
    expect(can(userFor('controller'), 'verify_defect', 'defects')).toBe(false);
  });
});

describe('can() — admin actions', () => {
  it('only owner can manage companies', () => {
    expect(can(userFor('owner'), 'manage_companies', 'admin.companies')).toBe(true);
    expect(can(userFor('company_manager'), 'manage_companies', 'admin.companies')).toBe(false);
  });

  it('owner and manager can manage users', () => {
    expect(can(userFor('owner'), 'manage_users', 'admin.users')).toBe(true);
    expect(can(userFor('company_manager'), 'manage_users', 'admin.users')).toBe(true);
    expect(can(userFor('controller'), 'manage_users', 'admin.users')).toBe(false);
  });

  it('only owner can manage rules and integrations', () => {
    expect(can(userFor('owner'), 'manage_rules', 'admin.rules')).toBe(true);
    expect(can(userFor('company_manager'), 'manage_rules', 'admin.rules')).toBe(false);
    expect(can(userFor('owner'), 'manage_integrations', 'admin.integrations')).toBe(true);
    expect(can(userFor('company_manager'), 'manage_integrations', 'admin.integrations')).toBe(false);
  });
});

describe('dbsVisibility', () => {
  it('owner and HR see full DBS', () => {
    expect(dbsVisibility('owner')).toBe('full');
    expect(dbsVisibility('hr_vetting')).toBe('full');
  });

  it('manager and controller see summary only', () => {
    expect(dbsVisibility('company_manager')).toBe('summary');
    expect(dbsVisibility('controller')).toBe('summary');
  });

  it('driver, mechanic and auditor see none', () => {
    expect(dbsVisibility('driver_pa')).toBe('none');
    expect(dbsVisibility('mechanic')).toBe('none');
    expect(dbsVisibility('auditor')).toBe('none');
  });
});

describe('canAccessRoute', () => {
  it('all roles can access dashboard', () => {
    for (const role of ALL_ROLES) {
      expect(canAccessRoute(userFor(role), '/dashboard')).toBe(true);
    }
  });

  it('controller cannot access safeguarding', () => {
    expect(canAccessRoute(userFor('controller'), '/assurance/safeguarding')).toBe(false);
  });

  it('controller can access DBS (summary)', () => {
    expect(canAccessRoute(userFor('controller'), '/assurance/dbs')).toBe(true);
  });

  it('driver cannot access DBS', () => {
    expect(canAccessRoute(userFor('driver_pa'), '/assurance/dbs')).toBe(false);
  });

  it('only owner can access companies admin', () => {
    expect(canAccessRoute(userFor('owner'), '/admin/companies')).toBe(true);
    expect(canAccessRoute(userFor('company_manager'), '/admin/companies')).toBe(false);
  });

  it('manager can access users admin', () => {
    expect(canAccessRoute(userFor('company_manager'), '/admin/users')).toBe(true);
  });

  it('controller cannot access users admin', () => {
    expect(canAccessRoute(userFor('controller'), '/admin/users')).toBe(false);
  });
});

describe('roleLabel', () => {
  it('returns human-readable labels', () => {
    expect(roleLabel('owner')).toBe('Owner');
    expect(roleLabel('company_manager')).toBe('Company manager');
    expect(roleLabel('driver_pa')).toBe('Driver / PA');
    expect(roleLabel('hr_vetting')).toBe('HR / Vetting / Safeguarding');
  });
});

describe('DEMO_USERS', () => {
  it('has all 7 roles', () => {
    expect(Object.keys(DEMO_USERS).sort()).toEqual(ALL_ROLES.sort());
  });

  it('each user has matching role', () => {
    for (const role of ALL_ROLES) {
      expect(DEMO_USERS[role].role).toBe(role);
    }
  });

  it('each user has initials', () => {
    for (const role of ALL_ROLES) {
      expect(DEMO_USERS[role].initials.length).toBeGreaterThan(0);
    }
  });
});
