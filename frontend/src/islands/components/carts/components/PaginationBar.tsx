import React from 'react';
import { Button } from '@islands/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@islands/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { BASE_PAGE_SIZE_OPTIONS } from '../config';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  currentPageSize: number;
  onPageSizeChange: (_size: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  loading: boolean;
}

export function PaginationBar({
  currentPage,
  totalPages,
  currentPageSize,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  onFirstPage,
  onLastPage,
  loading,
}: PaginationBarProps) {
  return (
    <div
      className={
        'flex flex-col md:flex-row md:items-center md:justify-end gap-2 ' +
        'bg-white border border-violet-100 rounded-lg p-4 shadow-sm'
      }
    >
      <div className="flex items-center gap-2 justify-end">
        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-violet-200 hover:bg-violet-50">
              Page Size: {currentPageSize}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {BASE_PAGE_SIZE_OPTIONS.map(opt => (
              <DropdownMenuCheckboxItem
                key={opt}
                checked={currentPageSize === opt}
                onCheckedChange={() => onPageSizeChange(opt)}
              >
                {opt}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="border-violet-200 hover:bg-violet-50"
          onClick={onFirstPage}
          disabled={currentPage === 1 || loading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-violet-200 hover:bg-violet-50"
          onClick={onPreviousPage}
          disabled={currentPage === 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-violet-200 hover:bg-violet-50"
          onClick={onNextPage}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-violet-200 hover:bg-violet-50"
          onClick={onLastPage}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
