# DEC Fleet & Workforce Management — Architecture

## Overview

A Next.js 13.5 (App Router) single-page office dashboard for Dunstable Executive Cars. Built with TypeScript, Tailwind CSS and Radix UI primitives styled to the DEC brand. All data is simulated in-memory via a repository layer that can be swapped for a real API.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 13.5 App Router |
| Language | TypeScript 5.2 |
| Styling | Tailwind CSS 3.3 + brand tokens |
| UI primitives | Radix UI (shadcn/ui base, restyled) |
| Icons | lucide-react |
| State | React Context (session) + component state |
| Data | In-memory mock behind repository interfaces |
| Tests | Vitest |
| Deployment | Bolt / Netlify (Next.js plugin) |

## Directory structure

```
app/                    Next.js App Router pages and layouts
  login/                Role-selector login screen
  dashboard/            Configurable landing dashboard
  fleet/                Fleet module (vehicles list + detail)
  checks/               Daily checks + checklist builder
  defects/              Defects kanban + detail
  maintenance/          Services, workshop, inspections, costs (generic)
  people/               Drivers, PAs, training (list + detail)
  assurance/            Licence checks, DBS, safeguarding (generic)
  operations/           Expenses, incidents, grey fleet (generic)
  specialist/           Tachograph, earned recognition (generic)
  insight/              Reports, documents, audit (generic)
  admin/                Companies, users, rules, integrations, settings (generic)
  search/               Global search page
components/             Shared UI components
  ui/                   Radix-based primitives (button, dialog, etc.)
  app-shell.tsx         Sidebar + topbar shell
  session-provider.tsx  Auth/session context
  route-guard.tsx       Permission-based route protection
  data-table.tsx        Reusable sortable/filterable table with CSV export
  generic-module.tsx    Config-driven renderer for ~23 routes
  status-chip.tsx       4-status semantic badge
  due-date-badge.tsx    Date + relative label
  ...
lib/                   Business logic and data
  types.ts              All domain types
  rules.ts              Business logic (reminderDate, serviceDue, etc.)
  permissions.ts        can() permission engine + role matrix
  format.ts             UK date/currency formatting
  db.ts                 Seeded mock data with edge cases
  repos.ts              Repository interfaces + mock implementations
  nav.ts                Navigation group config
docs/                  Project documentation
  ARCHITECTURE.md       This file
  PERMISSIONS.md        Role matrix and permission rules
  REQUIREMENTS_MATRIX.md  Feature coverage matrix
  README.md             Getting started and deliverable summary
```

## Config-driven module architecture

Most list/overview screens are rendered by a single `GenericModule` component driven by a `MODULES` config record keyed by route path. Each config entry declares:

- `title`, `description`, `icon`
- `type`: `table` | `info` | `cards`
- `columns`: typed column definitions (for table type)
- `rows`: data getter function
- `getRowId`, `onRowClick`, `searchFn`, `exportFilename`
- `infoContent` / `cards`: JSX for non-table types

This allows ~23 routes to be covered by one component + one config object, with each route's page being a thin re-export wrapper:

```tsx
'use client';
export { default } from '@/components/generic-module-page';
```

## Repository pattern

All data access goes through typed repository interfaces in `lib/repos.ts`. Components never import `db.ts` directly. To connect a real backend, replace the mock implementations with fetch/Supabase calls — the component layer is unaffected.

```typescript
export interface VehicleRepo {
  list(filter?: { companyId?: string; depotId?: string; status?: string }): Vehicle[];
  get(id: string): Vehicle | undefined;
  byRegistration(reg: string): Vehicle | undefined;
}
```

## Session & auth

- Simulated auth via React Context (`SessionProvider`)
- 7 demo roles, each with a demo user
- `login(role)` stores the user in localStorage
- `viewAsRole` lets the Owner preview the app as any role (demo feature)
- `RouteGuard` checks `canAccessRoute()` and redirects or shows a no-access screen
- No real credentials, no server round-trip

## Status model

Four statuses used consistently across vehicles, people, checks and defects:

| Status | Colour | Meaning |
|--------|--------|---------|
| Ready | Green | Fully compliant, cleared for duty |
| Due soon | Amber | Within reminder window, action needed |
| Blocked | Red | Expired, failed, revoked — cannot operate |
| Verification pending | Grey-blue | Awaiting manual verification |

## Brand & design system

- Primary brand colour: `#b01020` (deep crimson, sampled from the DEC logo)
- HSL token: `--brand: 354 76% 40%`
- Status colours: ok (green), warn (amber), bad (red), pending (slate-blue)
- Font: Inter
- Tabular numerals for all numeric data (`tnum` utility class)
- 8px spacing system
- Light and dark themes via `next-themes`
- Responsive: mobile sidebar via Sheet, hideOnMobile column flag

## Timezone & dates

- All dates stored as UTC ISO strings
- Display in Europe/London timezone
- DD/MM/YYYY date format
- Demo "today" fixed at 2026-10-27 for deterministic seeding and tests
