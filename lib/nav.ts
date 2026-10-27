import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Car, Wrench, ClipboardCheck, AlertTriangle, Users,
  ShieldCheck, Receipt, FileText, BarChart3, Settings, Building2,
  Gauge, Award, FolderArchive, UserCog, Scale, Plug, Clock,
  Package, CalendarDays, ListChecks,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: 'critical' | 'warning';
}
export interface NavGroup {
  label: string;
  items: NavItem[];
  restricted?: boolean;
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Vehicles', href: '/fleet/vehicles', icon: Car, badge: 'critical' },
      { label: 'Equipment', href: '/fleet/equipment', icon: Package },
      { label: 'Assignments & Planner', href: '/fleet/planner', icon: CalendarDays },
    ],
  },
  {
    label: 'Checks & Defects',
    items: [
      { label: 'Daily Checks', href: '/checks/daily', icon: ClipboardCheck, badge: 'warning' },
      { label: 'Checklist Builder', href: '/checks/builder', icon: ListChecks },
      { label: 'Defects', href: '/defects', icon: AlertTriangle, badge: 'critical' },
    ],
  },
  {
    label: 'Maintenance',
    items: [
      { label: 'Service Schedules', href: '/maintenance/services', icon: Gauge },
      { label: 'Workshop Planner', href: '/maintenance/workshop', icon: Wrench },
      { label: 'Inspections', href: '/maintenance/inspections', icon: ClipboardCheck },
      { label: 'Repair & Cost Ledger', href: '/maintenance/costs', icon: Receipt },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Drivers', href: '/people/drivers', icon: Users },
      { label: 'Passenger Assistants', href: '/people/pas', icon: Users },
      { label: 'Training', href: '/people/training', icon: FileText },
      { label: 'Workforce Planner', href: '/people/planner', icon: CalendarDays },
    ],
  },
  {
    label: 'Assurance',
    restricted: true,
    items: [
      { label: 'Licence Checks', href: '/assurance/licences', icon: ShieldCheck },
      { label: 'DBS Review', href: '/assurance/dbs', icon: ShieldCheck, badge: 'warning' },
      { label: 'Safeguarding Cases', href: '/assurance/safeguarding', icon: ShieldCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Expenses & Fuel', href: '/operations/expenses', icon: Receipt },
      { label: 'Incidents', href: '/operations/incidents', icon: AlertTriangle },
      { label: 'Grey Fleet', href: '/operations/grey-fleet', icon: Car },
    ],
  },
  {
    label: 'Specialist',
    items: [
      { label: 'Tachograph', href: '/specialist/tachograph', icon: Clock },
      { label: 'Earned Recognition', href: '/specialist/earned-recognition', icon: Award },
    ],
  },
  {
    label: 'Insight',
    items: [
      { label: 'Reports', href: '/insight/reports', icon: BarChart3 },
      { label: 'Documents & Messages', href: '/insight/documents', icon: FolderArchive },
      { label: 'Audit Log', href: '/insight/audit', icon: FileText },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Companies', href: '/admin/companies', icon: Building2 },
      { label: 'Users & Roles', href: '/admin/users', icon: UserCog },
      { label: 'Rules Register', href: '/admin/rules', icon: Scale },
      { label: 'Integrations', href: '/admin/integrations', icon: Plug },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];
