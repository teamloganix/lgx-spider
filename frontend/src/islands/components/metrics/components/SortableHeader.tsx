import React from 'react';
import { TableHead } from '@islands/components/ui/table';
import { Button } from '@islands/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { MetricsColumnConfig } from '../utils/config';

interface SortableHeaderProps {
  column: MetricsColumnConfig;
  sortField: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (_columnId: string) => void;
}

export function SortableHeader({ column, sortField, sortDir, onSort }: SortableHeaderProps) {
  const fieldForSort = column.id;
  const isSorted = sortField === fieldForSort;

  const gradient = 'bg-gradient-to-r from-violet-50 to-indigo-50';
  const shadowSticky = 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]';
  const stickyClass =
    column.frozen && column.id === 'id'
      ? `sticky left-0 z-10 min-w-[4rem] ${gradient} ${shadowSticky}`
      : column.frozen && column.id === 'domain'
        ? `sticky left-16 z-10 min-w-[180px] ${gradient} ${shadowSticky}`
        : gradient;

  return (
    <TableHead className={`whitespace-nowrap text-violet-900 font-semibold ${stickyClass}`}>
      {column.sortable ? (
        <div className="flex items-center gap-2 group">
          <span className="font-semibold">{column.label}</span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${
              isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={e => {
              e.stopPropagation();
              onSort(column.id);
            }}
          >
            {isSorted ? (
              sortDir === 'ASC' ? (
                <ArrowUp className="h-3 w-3 text-violet-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-violet-600" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </div>
      ) : (
        <span className="font-semibold">{column.label}</span>
      )}
    </TableHead>
  );
}
