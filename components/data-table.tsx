'use client';

import * as React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  filterable?: boolean;
  filterOptions?: { value: string; label: string }[];
  width?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ElementType;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  enableExport?: boolean;
  exportFilename?: string;
  searchPlaceholder?: string;
  searchFn?: (row: T, q: string) => boolean;
  defaultFilters?: Record<string, string>;
  className?: string;
}

export function DataTable<T>({
  columns, rows, getRowId, onRowClick,
  emptyTitle = 'No records found', emptyDescription = 'There are no records matching the current filters.',
  emptyIcon, initialSort, enableExport = true, exportFilename = 'export',
  searchPlaceholder = 'Search…', searchFn, defaultFilters, className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(initialSort ?? null);
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>(defaultFilters ?? {});
  const [showFilters, setShowFilters] = React.useState(false);

  const filtered = React.useMemo(() => {
    let r = rows;
    if (query && searchFn) {
      const q = query.toLowerCase();
      r = r.filter(row => searchFn(row, q));
    }
    for (const [k, v] of Object.entries(filters)) {
      if (!v || v === '__all') continue;
      const col = columns.find(c => c.key === k);
      if (col?.filterOptions) {
        r = r.filter(row => (col.sortValue?.(row) ?? String(col.render(row))) === v);
      }
    }
    if (sort) {
      const col = columns.find(c => c.key === sort.key);
      if (col?.sortValue) {
        r = [...r].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return sort.dir === 'asc' ? -1 : 1;
          if (av > bv) return sort.dir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return r;
  }, [rows, query, filters, sort, columns, searchFn]);

  const toggleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const exportCSV = () => {
    const headers = columns.map(c => `"${c.header}"`).join(',');
    const lines = filtered.map(row =>
      columns.map(c => {
        const sv = c.sortValue?.(row);
        const val = sv !== undefined ? sv : extractText(c.render(row));
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = columns.some(c => c.filterable);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search table"
          />
        </div>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={() => setShowFilters(s => !s)} className="gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>
        )}
        {enableExport && (
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        )}
      </div>

      {showFilters && hasFilters && (
        <div className="flex flex-wrap gap-2 rounded-md border border-border bg-muted/40 p-3 animate-fade-in">
          {columns.filter(c => c.filterable).map(col => (
            <div key={col.key} className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">{col.header}</label>
              <select
                value={filters[col.key] ?? '__all'}
                onChange={e => setFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                className="h-7 rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="__all">All</option>
                {col.filterOptions?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
            <tr className="border-b border-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'h-10 px-3 text-left align-middle text-xs font-semibold text-muted-foreground whitespace-nowrap',
                    col.hideOnMobile && 'hidden md:table-cell',
                    onRowClick && 'cursor-pointer select-none',
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortValue && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortValue && (
                      sort?.key === col.key ? (
                        sort.dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : <ChevronsUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              filtered.map(row => (
                <tr
                  key={getRowId(row)}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-muted/40' : '',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn('px-3 py-2 align-middle', col.hideOnMobile && 'hidden md:table-cell')}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  return '';
}
