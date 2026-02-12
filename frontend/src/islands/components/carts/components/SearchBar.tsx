import React from 'react';
import { Input } from '@islands/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (_query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 bg-white border border-violet-100 rounded-lg p-4 shadow-sm">
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
    </div>
  );
}
