import React, { useState } from 'react';
import { Button } from '@islands/components/ui/button';
import { Input } from '@islands/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@islands/components/ui/dropdown-menu';
import { Settings2, Filter, Search, X } from 'lucide-react';
import { getDefaultEmailColumns } from '../config';
import type { EmailColumnConfig } from '../config';

interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (_query: string) => void;
  columns: EmailColumnConfig[];
  onToggleColumnVisibility: (_columnId: string) => void;
  onResetColumns?: () => void;
  onOpenFilters?: () => void;
}

export function ControlsBar({
  searchQuery,
  onSearchChange,
  columns,
  onToggleColumnVisibility,
  onResetColumns,
  onOpenFilters,
}: ControlsBarProps) {
  const defaultColumns = getDefaultEmailColumns();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hasColumnChanges = columns.some(col => {
    const defaultCol = defaultColumns.find(dc => dc.id === col.id);
    if (!defaultCol) return false;
    return col.visible !== defaultCol.visible;
  });

  return (
    <div
      className={
        'flex flex-col sm:flex-row items-start sm:items-center ' +
        'justify-between gap-4 bg-white border border-violet-100 rounded-lg p-4 shadow-sm'
      }
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 max-w-xs">
          {searchQuery.length === 0 ? (
            <Search
              className={
                'absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ' +
                'text-muted-foreground pointer-events-none'
              }
            />
          ) : (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className={
                'absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 ' +
                'flex items-center justify-center text-muted-foreground ' +
                'hover:text-foreground cursor-pointer'
              }
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Input
            placeholder="Search by domain"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-violet-200 hover:bg-violet-50 shrink-0"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {hasColumnChanges && onResetColumns && (
              <div className="flex items-center justify-end p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onResetColumns();
                    setDropdownOpen(false);
                  }}
                  className={
                    'h-6 text-xs text-slate-600 hover:text-slate-900 ' +
                    'border border-dashed border-slate-300 rounded'
                  }
                >
                  Reset
                </Button>
              </div>
            )}
            {columns.map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => onToggleColumnVisibility(column.id)}
                disabled={column.id === 'domain' || column.id === 'actions'}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {onOpenFilters && (
          <Button
            variant="outline"
            size="sm"
            className="border-violet-200 hover:bg-violet-50 shrink-0"
            onClick={() => onOpenFilters()}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        )}
      </div>
    </div>
  );
}
