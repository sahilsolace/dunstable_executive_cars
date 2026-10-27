'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Bell, ChevronDown, Building2, MapPin, LogOut, User as UserIcon,
  Moon, Sun, X, Menu, ShieldAlert, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/components/session-provider';
import { navGroups } from '@/lib/nav';
import { canAccessRoute, roleLabel } from '@/lib/permissions';
import { companyRepo, notificationRepo } from '@/lib/repos';
import type { Role } from '@/lib/types';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { StatusDot } from '@/components/status-chip';
import { fmtDateTime } from '@/lib/format';

const LOGO_URL = '/image.png';

const ALL_ROLES: Role[] = ['owner', 'company_manager', 'controller', 'driver_pa', 'mechanic', 'hr_vetting', 'auditor'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { effectiveUser, user, viewAsRole, logout, setViewAs, switchCompany, switchDepot } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  if (!effectiveUser) return null;

  const companies = companyRepo.list().filter(c => !c.archived);
  const depots = companyRepo.depots(effectiveUser.companyId);
  const notifications = notificationRepo.list();
  const unreadCount = notifications.filter(n => !n.read).length;

  const activeCompany = companyRepo.get(effectiveUser.companyId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <img src={LOGO_URL} alt="DEC" className="h-7 w-auto" />
        <span className="text-xs font-semibold text-muted-foreground leading-tight">
          Fleet &amp; Workforce
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main navigation">
        {navGroups.map(group => {
          const items = group.items.filter(item => canAccessRoute(effectiveUser, item.href));
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mb-4">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
                {group.restricted && <ShieldAlert className="ml-1 inline h-3 w-3 text-muted-foreground/50" />}
              </p>
              <ul className="space-y-0.5">
                {items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-brand text-brand-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge === 'critical' && <span className="h-1.5 w-1.5 rounded-full bg-bad" />}
                        {item.badge === 'warning' && <span className="h-1.5 w-1.5 rounded-full bg-warn" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
          <span>All systems operational</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 lg:px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>

          {/* Company / depot switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">{activeCompany?.tradingName ?? 'All companies'}</span>
                {effectiveUser.depotId && (
                  <span className="hidden items-center gap-0.5 text-xs text-muted-foreground md:inline-flex">
                    <MapPin className="h-3 w-3" />
                    {companyRepo.depots().find(d => d.id === effectiveUser.depotId)?.name ?? ''}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Company</DropdownMenuLabel>
              {companies.map(c => (
                <DropdownMenuItem key={c.id} onClick={() => switchCompany(c.id)} className={cn(effectiveUser.companyId === c.id && 'font-semibold')}>
                  <Building2 className="mr-2 h-3.5 w-3.5" />
                  {c.tradingName}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Depot</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => switchDepot(undefined)}>
                <MapPin className="mr-2 h-3.5 w-3.5" /> All depots
              </DropdownMenuItem>
              {depots.map(d => (
                <DropdownMenuItem key={d.id} onClick={() => switchDepot(d.id)} className={cn(effectiveUser.depotId === d.id && 'font-semibold')}>
                  <MapPin className="mr-2 h-3.5 w-3.5" /> {d.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vehicles, drivers, defects…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Global search"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground hidden md:block">⌘K</kbd>
          </form>

          <div className="flex-1" />

          {/* View as role */}
          {user?.role === 'owner' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 hidden md:inline-flex">
                  <Eye className="h-3.5 w-3.5" />
                  {viewAsRole ? roleLabel(viewAsRole) : 'View as…'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>View as role (demo)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewAs(null)} className={cn(!viewAsRole && 'font-semibold')}>
                  My role: {roleLabel(user.role)}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_ROLES.filter(r => r !== user.role).map(r => (
                  <DropdownMenuItem key={r} onClick={() => setViewAs(r)} className={cn(viewAsRole === r && 'font-semibold')}>
                    {roleLabel(r)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-bad" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.slice(0, 6).map(n => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2">
                  <div className="flex items-center gap-1.5 w-full">
                    <span className={cn('h-1.5 w-1.5 rounded-full', n.kind === 'critical' ? 'bg-bad' : n.kind === 'warning' ? 'bg-warn' : 'bg-pending')} />
                    <span className="text-xs font-medium flex-1">{n.title}</span>
                    {!n.read && <span className="text-[10px] text-brand font-semibold">NEW</span>}
                  </div>
                  <p className="text-xs text-muted-foreground pl-3">{n.body}</p>
                  <span className="text-[10px] text-muted-foreground/70 pl-3">{fmtDateTime(n.at)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-foreground text-xs font-semibold">
                  {effectiveUser.initials}
                </span>
                <span className="hidden sm:inline text-sm">{effectiveUser.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{effectiveUser.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{effectiveUser.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <UserIcon className="h-3.5 w-3.5" /> Role: {roleLabel(effectiveUser.role)}
              </DropdownMenuItem>
              {viewAsRole && (
                <p className="px-2 py-1 text-xs text-brand">
                  Viewing as {roleLabel(viewAsRole)}
                </p>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="gap-2 text-bad-fg">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;
  return (
    <Button
      variant="ghost" size="icon" aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
