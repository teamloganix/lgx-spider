import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@islands/components/ui/table';
import { Button } from '@islands/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@islands/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { DraggableTableHeader } from './DraggableTableHeader';
import { PaginationBar } from './PaginationBar';
import type { CartItem } from '../../../../types/cart';
import type { CartColumn, CartColumnId } from '../config';
import { getDefaultColumns } from '../config';

interface CartsListProps {
  items: CartItem[];
  columns: CartColumn[];
  selectedIds: Set<number>;
  onToggleSelect: (_id: number) => void;
  onSelectAll: () => void;
  onColumnsChange: (_columns: CartColumn[]) => void;
  onSort: (_columnId: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onDeleteItem: (_id: number) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
  onPageChange: (_page: number) => void;
  onPageSizeChange: (_size: number) => void;
  loading: boolean;
}

const formatDate = (iso: string) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

export function CartsList({
  items,
  columns,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onColumnsChange,
  onSort,
  sortConfig,
  onDeleteItem,
  pagination,
  onPageChange,
  onPageSizeChange,
  loading,
}: CartsListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [dropIndicators, setDropIndicators] = useState<Record<string, 'left' | 'right' | null>>({});
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);

  const allSelected = items.length > 0 && items.every(item => selectedIds.has(item.id));

  const moveColumn = (dragId: string, targetId: string, position: 'before' | 'after') => {
    const defaults = getDefaultColumns();
    const order = columns.map(c => c.id);
    const dragIdx = order.indexOf(dragId as CartColumnId);
    const targetIdx = order.indexOf(targetId as CartColumnId);
    if (dragIdx === -1 || targetIdx === -1) return;
    const [removed] = order.splice(dragIdx, 1);
    const insertIdx = position === 'after' ? targetIdx + 1 : targetIdx;
    order.splice(insertIdx, 0, removed);
    const newColumns = order
      .map(id => defaults.find(d => d.id === id))
      .filter((c): c is CartColumn => Boolean(c));
    onColumnsChange(newColumns.length ? newColumns : defaults);
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

  const handleDeleteConfirm = () => {
    if (deleteConfirmId != null) {
      onDeleteItem(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="border border-violet-200 rounded-lg overflow-x-auto bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b-2 border-violet-200">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-violet-300"
                  aria-label="Select all"
                />
              </TableHead>
              {columns.map(col => (
                <DraggableTableHeader
                  key={col.id}
                  column={col}
                  sortConfig={sortConfig}
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
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base font-medium text-slate-900">No items in cart</span>
                    <span className="text-sm text-muted-foreground">
                      We are looking for domains to add to your cart, come back later.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow
                  key={item.id}
                  className="border-b border-violet-100 hover:bg-violet-50/50"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => onToggleSelect(item.id)}
                      className="h-4 w-4 rounded border-violet-300"
                      aria-label={`Select ${item.domain}`}
                    />
                  </TableCell>
                  {columns.map(col => {
                    if (col.id === 'domain') {
                      const url = item.domain
                        ? `https://${item.domain.replace(/^https?:\/\//, '')}`
                        : '';
                      return (
                        <TableCell key={col.id}>
                          <button
                            type="button"
                            className="text-violet-600 hover:underline"
                            onClick={e => {
                              e.stopPropagation();
                              if (url) {
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          >
                            {item.domain || '—'}
                          </button>
                        </TableCell>
                      );
                    }
                    if (col.id === 'keywords') {
                      return (
                        <TableCell key={col.id} className="max-w-xs truncate">
                          {item.keywords || '—'}
                        </TableCell>
                      );
                    }
                    if (col.id === 'similarity_score') {
                      return (
                        <TableCell key={col.id}>
                          {item.similarity_score != null ? item.similarity_score.toFixed(1) : '—'}
                        </TableCell>
                      );
                    }
                    if (col.id === 'added_at') {
                      return <TableCell key={col.id}>{formatDate(item.added_at)}</TableCell>;
                    }
                    if (col.id === 'actions') {
                      return (
                        <TableCell key={col.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(item.id)}
                            aria-label={`Delete ${item.domain}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      );
                    }
                    return <TableCell key={col.id}>—</TableCell>;
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <PaginationBar
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          currentPageSize={pagination.pageSize}
          onPageSizeChange={onPageSizeChange}
          onPreviousPage={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
          onNextPage={() =>
            onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))
          }
          onFirstPage={() => onPageChange(1)}
          onLastPage={() => onPageChange(pagination.totalPages)}
          loading={loading}
        />
      </div>

      <Dialog open={deleteConfirmId != null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from the cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}
