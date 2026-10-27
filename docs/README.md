# DEC Fleet & Workforce Management

A complete office dashboard for Dunstable Executive Cars — a taxi, school-run and wheelchair-accessible transport company in Dunstable, Central Bedfordshire.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you will be redirected to the login page.

## Demo logins

Choose any of the 7 roles on the login screen and click "Sign in". No password is required — this is a simulated demo environment.

| Role | Name | What they can see |
|------|------|-------------------|
| Owner | Sarah Whitfield | Everything — all modules, companies, users, integrations, audit. |
| Company manager | James Okoro | Vehicles, defects, people, release to service, audit. DBS summary only. |
| Controller | Priya Patel | View-only operational dashboard. DBS summary only — no certificate detail. |
| Driver / PA | Mark Davies | Daily checks and assignments. |
| Mechanic / Garage | Tom Bridger | Workshop, defect verification, maintenance. |
| HR / Vetting / Safeguarding | Anita Sharma | Licence checks, DBS review, safeguarding cases, audit. |
| Auditor / Support | External Audit | Read-only access including audit log and exports. |

The Owner can use the **"View as role"** dropdown in the topbar to preview the app as any other role.

## What this is

An operations dashboard covering:

- **Fleet** — 25 vehicles across 2 companies and 3 depots, with dual MOT and council six-month date tracking
- **Checks & Defects** — daily walkaround checks, checklist builder with version history, defect kanban with release-to-service gate
- **Maintenance** — service schedules (date or mileage, earlier wins), workshop planner, inspections, cost ledger
- **People** — 30 staff (drivers, passenger assistants, dual-role), licence and DBS tracking, training register
- **Assurance** — licence checks, DBS review (metadata only), safeguarding cases (restricted)
- **Operations** — expenses, incidents, grey fleet
- **Insight** — reports, documents, audit log
- **Admin** — companies, users, rules register, integrations, settings

## What is simulated

Everything in this demo is simulated:

- **Authentication** — login stores a demo user in localStorage. No real credentials, no server session.
- **Data persistence** — all data is in-memory. Changes are lost on page refresh.
- **All integrations** — DVLA ADD, DVSA MOT History, DVLA VES, council portals, DBS, SMS/email/push are all marked "Simulated", "Manual verification" or "Not connected". No live government connections exist.
- **Notifications** — seeded mock notifications, not real push/email.
- **File uploads and signatures** — upload and signature controls are visual only.
- **Reports** — CSV export works from tables; PDF/Excel export is visual only.

## What is needed for production

To turn this demo into a production system:

1. **Real backend and database** — replace the mock repository layer (`lib/repos.ts`) with API calls to a real database (e.g. Supabase/Postgres). The repository interfaces are already defined, so only the implementations need to change.
2. **Real authentication** — integrate Supabase Auth or another provider. Replace `SessionProvider` with server-validated sessions.
3. **DVLA/DVSA registration** — register for DVLA ADD, DVSA MOT History and DVLA VES API access. Replace the simulated adapters with real API clients.
4. **Council integration** — negotiate and build the council six-month check integration with Central Bedfordshire and Luton councils.
5. **DBS integration** — integrate with a DBS umbrella body for real status checks.
6. **Security review** — conduct a full security review covering RLS policies, column-level privileges, audit logging, and access control. See `docs/PERMISSIONS.md` for the permission model.
7. **Data protection and legal review** — conduct a DPIA and legal review per LAW-08. The Rules Register seeds Central Beds and Luton as "needs validation" — these must be validated by a qualified person before relying on them.
8. **Real notifications** — integrate SMS/email/push providers.
9. **File storage** — integrate Supabase Storage or equivalent for document and photo uploads.
10. **Tachograph and Earned Recognition** — activate only when the operator meets the prerequisites shown on those pages.

## Testing

```bash
npm run test
```

Runs unit tests for:
- Business logic rules (`lib/rules.ts`): reminder date clamping, MOT/council independence, booking vs overdue, service due trigger, defect blocking, check immutability
- Permission engine (`lib/permissions.ts`): `can()` for each role, DBS visibility tiers, route access, restricted resources

## Project structure

See `docs/ARCHITECTURE.md` for the full architecture, `docs/PERMISSIONS.md` for the permission model, and `docs/REQUIREMENTS_MATRIX.md` for requirement coverage.

## Brand

Logo and primary colour (#b01020, deep crimson) sourced from https://dunstablexecutivecars.co.uk/

## Disclaimer

This is a demo. It does not claim DVSA approval, Earned Recognition status, or legal compliance. All government data connections are simulated. Do not enter real personal data.
