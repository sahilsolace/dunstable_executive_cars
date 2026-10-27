// UK-friendly formatting. Store UTC, display Europe/London DD/MM/YYYY.

export function fmtDate(iso?: string | Date): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function fmtDateShort(iso?: string | Date): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

export function fmtDateTime(iso?: string | Date): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '—';
  return `${fmtDate(d)} ${fmtTime(d)}`;
}

export function fmtTime(iso?: string | Date): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? newDate(iso) : iso;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
}

function newDate(iso: string): Date {
  return new Date(iso);
}

export function fmtGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount);
}

export function fmtMiles(n: number): string {
  return new Intl.NumberFormat('en-GB').format(n) + ' mi';
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat('en-GB').format(n);
}

export function fmtReg(reg: string): string {
  return reg.toUpperCase();
}

export function daysUntilLabel(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const today = new Date('2026-10-27T00:00:00Z');
  const ms = d.getTime() - today.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 31) return `in ${days}d`;
  return `in ${Math.round(days / 30)}mo`;
}

export function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}
