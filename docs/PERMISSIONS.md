# Permissions

## Roles

Seven demo roles are defined. Each maps to a realistic DEC staff position.

| Role key | Label | Description |
|----------|-------|-------------|
| `owner` | Owner | Full access to all modules, companies, users, integrations and audit. |
| `company_manager` | Company manager | Manage vehicles, defects, people; release vehicles to service. |
| `controller` | Controller | View-only operational dashboard. DBS summary only. |
| `driver_pa` | Driver / PA | Driver and passenger assistant view — daily checks and assignments. |
| `mechanic` | Mechanic / Garage | Workshop, defect verification and maintenance scheduling. |
| `hr_vetting` | HR / Vetting / Safeguarding | Licence checking, DBS review and safeguarding case management. |
| `auditor` | Auditor / Support | Read-only access including audit log and exports. |

## Permission engine

A single `can(user, action, resource, field?)` function in `lib/permissions.ts` is the source of truth. It is used by:

- `RouteGuard` — route access
- `AppShell` sidebar — nav filtering
- DBS visibility in person detail pages
- Export buttons and restricted document access

### Actions

`view`, `create`, `edit`, `delete`, `export`, `view_restricted`, `view_dbs_detail`, `view_dbs_summary`, `release_to_service`, `verify_defect`, `manage_companies`, `manage_users`, `manage_rules`, `manage_integrations`, `view_audit`, `view_dbs_certificate`

### Role-action matrix

| Action | Owner | Manager | Controller | Driver/PA | Mechanic | HR/Vetting | Auditor |
|--------|:-----:|:-------:|:----------:|:---------:|:--------:|:----------:|:-------:|
| view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| create | ✓ | ✓ | — | — | — | — | — |
| edit | ✓ | ✓ | — | — | ✓ | ✓ | — |
| delete | ✓ | — | — | — | — | — | — |
| export | ✓ | ✓ | ✓ | — | — | — | ✓ |
| view_restricted | ✓ | — | — | — | — | ✓ | — |
| view_dbs_detail | ✓ | — | — | — | — | ✓ | — |
| view_dbs_summary | ✓ | ✓ | ✓ | — | — | ✓ | — |
| release_to_service | ✓ | ✓ | — | — | — | — | — |
| verify_defect | ✓ | ✓ | — | — | ✓ | — | — |
| manage_companies | ✓ | — | — | — | — | — | — |
| manage_users | ✓ | ✓ | — | — | — | — | — |
| manage_rules | ✓ | — | — | — | — | — | — |
| manage_integrations | ✓ | — | — | — | — | — | — |
| view_audit | ✓ | ✓ | — | — | — | ✓ | ✓ |

## Restricted resources

Some resources are gated entirely by role, regardless of action:

| Resource key | Allowed roles |
|-------------|---------------|
| `assurance.dbs` | Owner, HR/Vetting |
| `assurance.licences` | Owner, Company manager, HR/Vetting |
| `assurance.safeguarding` | Owner, HR/Vetting |
| `admin.audit` | Owner, Auditor, HR/Vetting |

## Route gates

Routes map to a required action via `canAccessRoute()`:

| Route | Required action |
|-------|----------------|
| `/assurance/licences` | `view_dbs_summary` |
| `/assurance/dbs` | `view_dbs_summary` |
| `/assurance/safeguarding` | `view_restricted` |
| `/admin/companies` | `manage_companies` |
| `/admin/users` | `manage_users` |
| `/admin/rules` | `manage_rules` |
| `/admin/integrations` | `manage_integrations` |
| `/admin/audit` | `view_audit` |
| `/admin/settings` | `manage_companies` |

All other routes require `view` on the route path.

## DBS visibility tiers

`dbsVisibility(role)` returns one of three tiers, used in person detail pages:

| Tier | Roles | What is shown |
|------|-------|---------------|
| `full` | Owner, HR/Vetting | DBS ID, full status, last/next review, certificate metadata |
| `summary` | Company manager, Controller | Cleared/Pending/Restricted status + next review date only |
| `none` | Driver/PA, Mechanic, Auditor | No DBS tab shown |

## Special rules

- **Controller DBS detail**: Controllers can see DBS *summary* but never *detail* (no certificate numbers or review notes).
- **Release to service**: Requires a second authorised person (Owner or Company manager). The mechanic who did the repair cannot release the vehicle they repaired — independent verification is required.
- **Verify defect**: Owner, Company manager, or Mechanic.
- **View as role**: Only the Owner can use the "View as role" demo switcher.

## Demo users

| Role | Name | Email |
|------|------|-------|
| Owner | Sarah Whitfield | sarah@dec-fleet.co.uk |
| Company manager | James Okoro | james@dec-fleet.co.uk |
| Controller | Priya Patel | priya@dec-fleet.co.uk |
| Driver / PA | Mark Davies | mark@dec-fleet.co.uk |
| Mechanic | Tom Bridger | tom@dec-fleet.co.uk |
| HR / Vetting | Anita Sharma | anita@dec-fleet.co.uk |
| Auditor | External Audit | audit@dec-fleet.co.uk |
