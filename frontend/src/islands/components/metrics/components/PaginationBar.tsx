import React from 'react';
import { Button } from '@islands/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@islands/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import { BASE_PAGE_SIZE_OPTIONS } from '../utils/config';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  currentPageSize: number;
  onPageSizeChange: (_size: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onDownloadCsv?: () => void;
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
  onDownloadCsv,
  loading,
}: PaginationBarProps) {
  return (
    <div
      className={
        'flex flex-col md:flex-row md:items-center md:justify-between gap-2 ' +
        'bg-white border border-violet-100 rounded-lg p-4 shadow-sm'
      }
    >
      <div className="flex items-center gap-2 order-2 md:order-1">
        {onDownloadCsv && (
          <Button
            variant="outline"
            size="sm"
            className="border-violet-200 hover:bg-violet-50"
            onClick={onDownloadCsv}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        )}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 order-1 md:order-2">
        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>
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
    </div>
  );
}
