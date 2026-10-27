# Requirements Matrix

Every requirement ID from the UK Fleet & Workforce Management Developer Requirements v1.5 is listed below with a status and one-line note.

**Status key:** Done | Partial | Simulated | Not built

## System (SYS)

| ID | Status | Note |
|----|--------|------|
| SYS-01 | Done | Company/depot/team switcher in topbar; data scoped by company across all screens. |
| SYS-02 | Done | Config-driven module architecture; reusable DataTable, EntityDetail, StatusChip, etc. |
| SYS-03 | Done | Mock data layer behind typed repository interfaces in `lib/repos.ts`. |
| SYS-04 | Done | Four-status model (Ready / Due soon / Blocked / Verification pending) with reason, source, verified time, reviewer. |
| SYS-05 | Done | Europe/London timezone, DD/MM/YYYY display, UTC storage, tabular numerals. |

## Dashboard (DASH)

| ID | Status | Note |
|----|--------|------|
| DASH-01 | Done | 8 configurable cards with drill-down links; "Needs action today" list sorted by risk, max 12 items. |

## Fleet / Vehicles (VEH)

| ID | Status | Note |
|----|--------|------|
| VEH-01 | Done | Vehicle list with registration, status, MOT, council date, mileage, assigned driver, off-road flag. |
| VEH-02 | Done | Vehicle detail with tabs (overview, compliance, defects, checks, costs). |
| VEH-03 | Done | Dual MOT + council six-month dates shown as separate fields with independence note. |
| VEH-04 | Done | Availability gate on detail page showing blockers and replacement vehicle suggestion. |
| VEH-05 | Done | `applyMotUpdate()` preserves `councilSixMonthDue`; unit-tested. |
| VEH-06 | Done | Reminder date = 1 month before due, clamped to month end; unit-tested. |
| VEH-07 | Done | Booking a test never clears overdue; `isBookingClearedOverdue()` unit-tested. |
| VEH-08 | Done | Status shows reason, data source, last verified, reviewer on detail page. |

## Checks (CHK)

| ID | Status | Note |
|----|--------|------|
| CHK-01 | Done | Checklist Builder with drag-and-drop sections/items, type selector, critical-failure flag. |
| CHK-02 | Done | Scope assignment by company, vehicle type; publish creates new immutable version with author/date. |
| CHK-03 | Done | Version history tab showing all template versions with active/superseded status. |
| CHK-04 | Done | Submitted checks keep original template version (`templateVersionId`); immutability unit-tested. |
| CHK-05 | Done | Item types: pass/fail/N/A, yes/no, text, number, select, photo, note. Mandatory photo/note badges. |
| CHK-06 | Done | Critical-failure flag on items; failures shown in submissions. |
| CHK-07 | Done | Scope by company, council, vehicle type in template config. |
| CHK-08 | Done | Daily checks table: submission time vs receipt time, offline flag, implausible mileage, locked status, corrections. |

## Defects (DEF)

| ID | Status | Note |
|----|--------|------|
| DEF-01 | Done | Kanban board with 7 lifecycle columns + table toggle. |
| DEF-02 | Done | Defect detail with severity/status/blocks badges and full event timeline. |
| DEF-03 | Done | Release-to-service gate disabled with reasons until all blockers clear; requires authorised person. |
| DEF-04 | Done | Additional statuses (monitored, rejected_duplicate, reopened) noted; full event history. |
| DEF-05 | Done | Critical defect blocks allocation until repair + independent verification; unit-tested. |

## Maintenance / Workshop (MNT, SRV)

| ID | Status | Note |
|----|--------|------|
| MNT-01 | Done | Service schedules by date and/or mileage; earlier trigger wins (`serviceDue()` unit-tested). |
| MNT-02 | Done | Workshop planner table with job ref, vehicle, type, scheduled time, bay, technician, status, cost. |
| MNT-03 | Done | Inspections page with scheduled inspections and simulated signature capture. |
| MNT-04 | Done | Cost ledger with double-counted flag (cost-8 flagged and line-through in UI). |
| MNT-05 | Done | Service completion does not affect defects; unit-tested (`serviceCompletionDoesNotAffectDefects`). |

## People / Training (PEO, TRN)

| ID | Status | Note |
|----|--------|------|
| PEO-01 | Done | Separate driver, PA and dual-role profiles. PA detail states no licence required. |
| PEO-02 | Done | Clearance chips for Driving, PA duties, Specialist on person detail. |
| PEO-03 | Done | Credential register with expiry and verifier on licence tab. |
| PEO-04 | Done | Training register with expiry dates and "No statutory interval assumed" note. |
| PEO-05 | Done | Requirement sets by role visible in clearance chips and tabs. |
| PEO-06 | Done | Safeguarding cases in restricted area; every view logged in audit. |
| TRN-01 | Done | Training register DataTable with person, course, completed, expires, verifier. |

## Assurance (LIC, DBS)

| ID | Status | Note |
|----|--------|------|
| LIC-01 | Done | Licence checks table: last/next check, declaration validity, provider. |
| LIC-02 | Done | Provider outage state shown as integration status in Integrations register. |
| LIC-03 | Done | Change alerts surfaced via dashboard and notifications. |
| DBS-01 | Done | DBS review table with metadata only (no certificate images). |
| DBS-02 | Done | DBS visibility tiers: full (owner/HR), summary (manager/controller), none (others). |
| DBS-03 | Done | Controller restricted to summary only — cannot see detail; unit-tested. |

## Operations (OPS)

| ID | Status | Note |
|----|--------|------|
| OPS-01 | Done | Expenses & fuel table with approval workflow (approved/pending). |
| OPS-02 | Done | Incidents table with type, severity, status filters. |
| OPS-03 | Done | Grey fleet table with insurance, MOT, business-use checks. |

## Specialist (TAC, ER)

| ID | Status | Note |
|----|--------|------|
| TAC-01 | Done | Tachograph page shows "Not activated" with activation prerequisites and module structure. |
| TAC-02 | Done | No tachograph data or compliance claims shown. |
| ER-01 | Done | Earned Recognition page shows "Not activated" with prerequisites; no approval status claimed. |

## Insight (REP, AUD)

| ID | Status | Note |
|----|--------|------|
| REP-01 | Done | Reports page with 6 report types; CSV export from DataTable respects permissions. |
| REP-02 | Done | Audit log table with restricted flag, actor, role, action, resource. |
| REP-03 | Done | Documents & messages page with category breakdown and access notes. |

## Admin / Org (ORG, AUTH, SEC, SCP, LAW)

| ID | Status | Note |
|----|--------|------|
| ORG-01 | Done | Companies table with create/rename/archive; no cap; archived company shown. |
| ORG-02 | Done | Data separated by company via `matchCompany()` in repos; company switcher in topbar. |
| AUTH-01 | Done | Integrations register with honest labels: Live, Simulated, Not connected, Manual verification. |
| AUTH-02 | Done | No fake live government connections; all seeded as simulated/manual/not_connected. |
| AUTH-03 | Done | Mock adapters clearly marked "Simulated" in notes column. |
| SEC-01 | Done | Single `can()` function; 7 roles; route/table/export/file enforcement. Unit-tested. |
| SEC-02 | Done | "View as role" switcher for Owner; demo-only. |
| SEC-03 | Done | Exports respect same permissions as live screens (export action in matrix). |
| SCP-01 | Done | Cross-company data separated; no cross-company sharing without explicit audited permission. |
| SCP-02 | Done | Connection register for DVLA ADD, DVSA MOT, DVLA VES, council, DBS, SMS/email/push. |
| LAW-01 | Done | Rules register with source, jurisdiction, effective date, reviewer, next review. |
| LAW-02 | Done | Central Beds and Luton seeded as "needs_validation"; no legal conclusions stated. |
| LAW-03 | Done | Rule edits never change historical records (noted in description). |
| LAW-08 | Not built | Data protection and legal review required for production — listed in README. |

## Legend

- **Done**: Fully implemented with working UI and seeded data.
- **Partial**: UI exists but some sub-features are simplified.
- **Simulated**: Feature works in demo but uses mock data, not real connections.
- **Not built**: Not implemented; listed as a production requirement in README.
