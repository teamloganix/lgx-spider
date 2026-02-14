import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../input';

interface SelectDropdownSearchProps {
  searchTerm: string;
  setSearchTerm: (_value: string) => void;
  setOpen: (_open: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function SelectDropdownSearch({
  searchTerm,
  setSearchTerm,
  setOpen,
  searchInputRef,
}: SelectDropdownSearchProps) {
  return (
    <div className="relative" onMouseDown={e => e.stopPropagation()}>
      {searchTerm.length === 0 ? (
        <Search
          className={
            'absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ' +
            'text-slate-400 pointer-events-none'
          }
        />
      ) : (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setSearchTerm('');
            searchInputRef.current?.focus();
          }}
          className={
            'absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 ' +
            'flex items-center justify-center text-slate-400 ' +
            'hover:text-slate-600 cursor-pointer'
          }
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => {
          e.stopPropagation();
          setSearchTerm(e.target.value);
        }}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        onFocus={e => e.stopPropagation()}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
          }
        }}
        autoFocus
        className="h-8 pl-7 text-sm"
      />
    </div>
  );
}
