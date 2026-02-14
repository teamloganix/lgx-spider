import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@islands/components/ui/table';
import { Button } from '@islands/components/ui/button';
import { Badge } from '@islands/components/ui/badge';
import { Mail } from 'lucide-react';
import { PaginationBar } from './PaginationBar';
import { DraggableTableHeader } from './DraggableTableHeader';
import type { EmailListItem } from '../../../../types/emails';
import type { EmailColumnConfig, EmailColumnId } from '../config';

function formatDate(iso: string | null): string {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

function formatNumber(n: number | null): string {
  if (n == null) return 'N/A';
  return n.toLocaleString();
}

function verdictVariant(verdict: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const v = verdict.toUpperCase();
  if (v === 'APPROVE') return 'default';
  if (v === 'REJECT') return 'destructive';
  return 'secondary';
}

function guestPostsVariant(gp: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const g = gp.toLowerCase();
  if (g === 'yes') return 'default';
  if (g === 'no') return 'destructive';
  return 'secondary';
}

function capitalizeVerdict(verdict: string): string {
  if (!verdict) return verdict;
  return verdict.charAt(0).toUpperCase() + verdict.slice(1).toLowerCase();
}

interface EmailsTableProps {
  items: EmailListItem[];
  columns: EmailColumnConfig[];
  onColumnsChange: (_columns: EmailColumnConfig[]) => void;
  sortField: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (_field: string) => void;
  pagination: { currentPage: number; totalPages: number; pageSize: number };
  onPageSizeChange: (_size: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  loading: boolean;
}

export function EmailsTable({
  items,
  columns,
  onColumnsChange,
  sortField,
  sortDir,
  onSort,
  pagination,
  onPageSizeChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  loading,
}: EmailsTableProps) {
  const visibleColumns = columns.filter(c => c.visible);
  const [dropIndicators, setDropIndicators] = useState<Record<string, 'left' | 'right' | null>>({});
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);

  const moveColumn = (
    dragId: EmailColumnId,
    targetId: EmailColumnId,
    position: 'before' | 'after'
  ) => {
    const order = columns.map(c => c.id);
    const dragIdx = order.indexOf(dragId);
    const targetIdx = order.indexOf(targetId);
    if (dragIdx === -1 || targetIdx === -1) return;
    const [removed] = order.splice(dragIdx, 1);
    const insertIdx = position === 'after' ? targetIdx + 1 : targetIdx;
    order.splice(insertIdx, 0, removed);
    const newColumns = order
      .map(id => columns.find(c => c.id === id))
      .filter((c): c is EmailColumnConfig => Boolean(c));
    onColumnsChange(newColumns.length ? newColumns : columns);
  };

  const handleDropIndicatorChange = (columnId: string, position: 'left' | 'right' | null) => {
    if (columnId === '') {
      setDropIndicators({});
      setIsDraggingColumn(false);
      return;
    }
    setIsDraggingColumn(true);
    setDropIndicators({ [columnId]: position });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div
          className={
            'border border-violet-200 rounded-lg overflow-x-auto bg-white shadow-sm overflow-y-visible'
          }
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b-2 border-violet-200">
                {visibleColumns.map(col => (
                  <DraggableTableHeader
                    key={col.id}
                    column={col}
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={onSort}
                    moveColumn={moveColumn}
                    dropIndicator={dropIndicators[col.id] ?? null}
                    onDropIndicatorChange={handleDropIndicatorChange}
                    isDraggingAny={isDraggingColumn}
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
                      <span className="text-base font-medium text-slate-900">No emails found</span>
                      <span className="text-sm text-muted-foreground">
                        Try adjusting your search to see more results.
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
                      className={`transition-colors border-b border-violet-100 hover:bg-violet-50/50 group ${
                        isEvenRow ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      {visibleColumns.map(col => {
                        const stickyClass =
                          col.frozen && col.id === 'domain'
                            ? 'sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]'
                            : col.id === 'actions'
                              ? 'sticky right-0 z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.05)]'
                              : '';
                        const bgClass =
                          col.frozen || col.id === 'actions'
                            ? isEvenRow
                              ? 'bg-white'
                              : 'bg-slate-50'
                            : isEvenRow
                              ? 'bg-white'
                              : 'bg-slate-50/50';
                        const cellClass =
                          `${stickyClass} ${bgClass} ` +
                          'group-hover:bg-violet-50/50 transition-colors';
                        if (col.id === 'domain') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              <a
                                href={`https://${row.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-700 hover:text-violet-600 hover:underline font-medium"
                              >
                                {row.domain}
                              </a>
                            </TableCell>
                          );
                        }
                        if (col.id === 'campaign_name') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              {row.campaign_name || '—'}
                            </TableCell>
                          );
                        }
                        if (col.id === 'link_value') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              <Badge variant="secondary">
                                {row.link_value != null ? row.link_value : 'N/A'}
                              </Badge>
                            </TableCell>
                          );
                        }
                        if (col.id === 'verdict') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              <Badge variant={verdictVariant(row.verdict)}>
                                {capitalizeVerdict(row.verdict)}
                              </Badge>
                            </TableCell>
                          );
                        }
                        if (col.id === 'priority') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              {row.priority}
                            </TableCell>
                          );
                        }
                        if (col.id === 'contact_emails') {
                          const emails = row.contact_emails ?? [];
                          const show = emails.slice(0, 2);
                          const rest = emails.length - 2;
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              {emails.length === 0 ? (
                                <span className="text-muted-foreground">No emails found</span>
                              ) : (
                                <>
                                  {show.map((e, i) => (
                                    <Badge key={i} variant="secondary" className="mr-1 mb-1">
                                      {e}
                                    </Badge>
                                  ))}
                                  {rest > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{rest} more
                                    </span>
                                  )}
                                </>
                              )}
                            </TableCell>
                          );
                        }
                        if (col.id === 'guest_posts') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              <Badge variant={guestPostsVariant(row.guest_posts)}>
                                {row.guest_posts}
                              </Badge>
                            </TableCell>
                          );
                        }
                        if (col.id === 'domain_rating') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              {row.domain_rating != null ? `DR: ${row.domain_rating}` : 'N/A'}
                            </TableCell>
                          );
                        }
                        if (col.id === 'org_traffic') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              {formatNumber(row.org_traffic)}
                            </TableCell>
                          );
                        }
                        if (col.id === 'org_keywords') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              {formatNumber(row.org_keywords)}
                            </TableCell>
                          );
                        }
                        if (col.id === 'analyzed_at') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              <span className="text-muted-foreground text-xs">
                                {formatDate(row.analyzed_at)}
                              </span>
                            </TableCell>
                          );
                        }
                        if (col.id === 'actions') {
                          return (
                            <TableCell key={col.id} className={cellClass}>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-violet-200 hover:bg-violet-50"
                                aria-label="Generate email"
                                onClick={() => {}}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={col.id} className={cellClass}>
                            —
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
          loading={loading}
        />
      </div>
    </DndProvider>
  );
}
