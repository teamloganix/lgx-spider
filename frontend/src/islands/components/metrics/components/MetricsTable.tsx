import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@islands/components/ui/table';
import { Badge } from '@islands/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { PaginationBar } from './PaginationBar';
import { SortableHeader } from './SortableHeader';
import type { MetricsListItem } from '../../../../types/metrics';
import type { MetricsColumnConfig } from '../utils/config';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatNumber(n: number | null): string {
  if (n == null || n === 0) return '—';
  return n.toLocaleString();
}

function formatCurrency(n: number | null): string {
  if (n == null) return '—';
  if (n === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status.toLowerCase();
  if (s === 'completed') return 'default';
  if (s === 'failed') return 'destructive';
  if (s === 'processing') return 'secondary';
  return 'outline';
}

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'completed') return 'text-green-600';
  if (s === 'failed') return 'text-red-600';
  if (s === 'processing') return 'text-blue-600';
  return 'text-amber-600';
}

interface MetricsTableProps {
  items: MetricsListItem[];
  columns: MetricsColumnConfig[];
  sortField: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (_field: string) => void;
  pagination: { currentPage: number; totalPages: number; pageSize: number };
  onPageSizeChange: (_size: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onDownloadCsv?: () => void;
  loading: boolean;
}

export function MetricsTable({
  items,
  columns,
  sortField,
  sortDir,
  onSort,
  pagination,
  onPageSizeChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onDownloadCsv,
  loading,
}: MetricsTableProps) {
  const visibleColumns = columns.filter(c => c.visible);

  const cellContent = (row: MetricsListItem, col: MetricsColumnConfig) => {
    switch (col.id) {
      case 'id':
        return <span className="text-left">{row.id}</span>;
      case 'domain':
        return (
          <a
            href={`https://${row.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 hover:text-violet-600 font-medium"
          >
            {row.domain}
          </a>
        );
      case 'campaign_name':
        return row.campaign_name || '—';
      case 'domain_rating':
        return (
          <span className="text-right">{row.domain_rating != null ? row.domain_rating : '—'}</span>
        );
      case 'org_traffic':
        return <span className="text-right tabular-nums">{formatNumber(row.org_traffic)}</span>;
      case 'org_keywords':
        return <span className="text-right tabular-nums">{formatNumber(row.org_keywords)}</span>;
      case 'org_cost':
        return <span className="text-right tabular-nums">{formatCurrency(row.org_cost)}</span>;
      case 'paid_traffic':
        return <span className="text-right tabular-nums">{formatNumber(row.paid_traffic)}</span>;
      case 'paid_keywords':
        return <span className="text-right tabular-nums">{formatNumber(row.paid_keywords)}</span>;
      case 'paid_cost':
        return <span className="text-right tabular-nums">{formatCurrency(row.paid_cost)}</span>;
      case 'top_country':
        return <span className="text-right">{row.top_country ?? '—'}</span>;
      case 'top_traffic':
        return <span className="text-right tabular-nums">{formatNumber(row.top_traffic)}</span>;
      case 'processing_status':
        return (
          <span className={`text-right capitalize ${statusClass(row.processing_status)}`}>
            <Badge variant={statusVariant(row.processing_status)}>{row.processing_status}</Badge>
          </span>
        );
      case 'created_at':
        return (
          <span className="text-right text-sm text-slate-600">
            {formatDateTime(row.created_at)}
          </span>
        );
      case 'updated_at':
        return (
          <span className="text-right text-sm text-slate-600">
            {formatDateTime(row.updated_at)}
          </span>
        );
      case 'error_message':
        return (
          <span
            className={`text-right text-sm max-w-[200px] truncate block ${
              row.error_message ? 'text-red-600' : 'text-slate-500'
            }`}
            title={row.error_message ?? undefined}
          >
            {row.error_message || '—'}
          </span>
        );
      default:
        return '—';
    }
  };

  const alignClass = (col: MetricsColumnConfig) => {
    if (col.id === 'domain' || col.id === 'campaign_name' || col.id === 'id') return 'text-left';
    return 'text-right';
  };

  return (
    <div className="space-y-4">
      <div
        className={
          'border border-violet-200 rounded-lg overflow-x-auto bg-white ' +
          'shadow-sm overflow-y-visible'
        }
      >
        <Table>
          <TableHeader>
            <TableRow
              className={
                'bg-gradient-to-r from-violet-50 to-indigo-50 ' +
                'border-b-2 border-violet-200 sticky top-0 z-10'
              }
            >
              {visibleColumns.map(col => (
                <SortableHeader
                  key={col.id}
                  column={col}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading data...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <BarChart3 className="h-10 w-10 text-slate-300" />
                    <span className="text-base font-medium text-slate-900">No metrics found</span>
                    <span className="text-sm text-muted-foreground">
                      Try adjusting your search or filters to see more results.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row, idx) => {
                const isEvenRow = idx % 2 === 0;
                return (
                  <TableRow
                    key={row.id}
                    className={`group transition-colors border-b border-violet-100 hover:bg-violet-50/50 ${
                      isEvenRow ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {visibleColumns.map(col => {
                      const stickyClass =
                        col.frozen && col.id === 'id'
                          ? 'sticky left-0 z-10 min-w-[4rem] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]'
                          : col.frozen && col.id === 'domain'
                            ? 'sticky left-16 z-10 min-w-[180px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]'
                            : '';
                      const bgClass = col.frozen
                        ? isEvenRow
                          ? 'bg-white'
                          : 'bg-slate-50'
                        : isEvenRow
                          ? 'bg-white'
                          : 'bg-slate-50/50';
                      const hoverClass = col.frozen
                        ? 'group-hover:bg-violet-50'
                        : 'group-hover:bg-violet-50/50';
                      const cellClass =
                        `${alignClass(col)} py-2 ${stickyClass} ${bgClass} ` +
                        `${hoverClass} transition-colors`;
                      return (
                        <TableCell key={col.id} className={cellClass}>
                          {cellContent(row, col)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationBar
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        currentPageSize={pagination.pageSize}
        onPageSizeChange={onPageSizeChange}
        onFirstPage={onFirstPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onLastPage={onLastPage}
        onDownloadCsv={onDownloadCsv}
        loading={loading}
      />
    </div>
  );
}
