import React from 'react';
import { X } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '../../dropdown-menu';
import type { SelectDropdownOption } from '../types';
import { SelectDropdownSearch } from './SelectDropdownSearch';

interface SelectDropdownContentProps {
  label: string;
  setOpen: (_open: boolean) => void;
  showSearch: boolean;
  searchTerm: string;
  setSearchTerm: (_value: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  selectedValues: Set<string>;
  displayOptions: SelectDropdownOption[];
  handleToggle: (_optionValue: string) => void;
  handleClearAll: (_e: React.MouseEvent<HTMLButtonElement>) => void;
  dropdownWidth: number | undefined;
  alignOffset: number;
}

export function SelectDropdownContent({
  label,
  setOpen,
  showSearch,
  searchTerm,
  setSearchTerm,
  searchInputRef,
  selectedValues,
  displayOptions,
  handleToggle,
  handleClearAll,
  dropdownWidth,
  alignOffset,
}: SelectDropdownContentProps) {
  return (
    <DropdownMenuContent
      align="start"
      alignOffset={alignOffset}
      sideOffset={4}
      className="z-[110] max-h-[280px] overflow-y-auto"
      style={{ width: dropdownWidth }}
      onInteractOutside={e => {
        if (showSearch) {
          const target = e.target as Node;
          if (searchInputRef.current?.contains(target) || searchInputRef.current === target) {
            e.preventDefault();
          }
        }
      }}
    >
      <div className="px-2 py-1.5 space-y-2">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <DropdownMenuLabel className="px-0 whitespace-nowrap shrink-0">
              {label}
            </DropdownMenuLabel>
            {selectedValues.size > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={
                  'h-5 text-xs text-slate-600 hover:text-slate-900 ' +
                  'flex items-center gap-1.5 sm:gap-1 shrink-0 px-1.5 sm:px-1 ' +
                  'border border-dashed border-slate-300 rounded-lg ' +
                  'bg-slate-50/50 hover:bg-slate-100/50'
                }
              >
                <X className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-red-400" />
                <span>Clear</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={
              'rounded-sm opacity-70 ring-offset-background transition-opacity ' +
              'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring ' +
              'focus:ring-offset-2 disabled:pointer-events-none shrink-0'
            }
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {showSearch && (
          <SelectDropdownSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setOpen={setOpen}
            searchInputRef={searchInputRef}
          />
        )}
      </div>
      {displayOptions.length > 0 ? (
        displayOptions.map(option => {
          const isChecked = selectedValues.has(option.value);
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isChecked}
              onCheckedChange={() => handleToggle(option.value)}
            >
              {option.render ? option.render(option, isChecked) : option.label}
            </DropdownMenuCheckboxItem>
          );
        })
      ) : (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">No results found</div>
      )}
    </DropdownMenuContent>
  );
}
