import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger } from '../dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';
import type { SelectDropdownProps } from './types';
import { useSelectDropdown } from './utils/use-select-dropdown';
import { SelectDropdownTrigger } from './components/SelectDropdownTrigger';
import { SelectDropdownContent } from './components/SelectDropdownContent';

export function SelectDropdown({
  label,
  tooltip,
  options,
  value = [],
  onValueChange,
  placeholder = 'Select',
  disabled = false,
  id,
  showSearch = true,
  singleSelect = false,
  lockedValues = [],
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);

  const {
    containerRef,
    triggerRef,
    searchInputRef,
    dropdownWidth,
    alignOffset,
    searchTerm,
    setSearchTerm,
    selectedValues,
    displayOptions,
    handleToggle,
    handleClearAll,
    handleContainerClick,
    getDisplayText,
  } = useSelectDropdown(
    value,
    options,
    onValueChange,
    open,
    setOpen,
    showSearch,
    singleSelect,
    lockedValues
  );

  const displayText = getDisplayText(placeholder, options);
  const isPlaceholder = selectedValues.size === 0;
  const placeholderClass = isPlaceholder ? 'text-slate-500' : 'text-slate-600';
  const triggerClass =
    'h-auto min-h-6 py-0 px-0 text-sm shrink-0 flex items-center gap-1.5 ' +
    'hover:bg-transparent whitespace-nowrap font-normal ';

  return (
    <div
      ref={containerRef}
      onClick={e => {
        const target = e.target as HTMLElement;
        if (triggerRef.current?.contains(target)) return;
        handleContainerClick(e);
      }}
      className={
        'flex items-center justify-center gap-2 rounded-full ' +
        'border border-slate-300 bg-white px-3 h-11 transition-colors ' +
        'cursor-pointer shadow-none w-full sm:w-auto min-h-[32px]'
      }
    >
      <span className="text-sm font-medium text-slate-600 shrink-0">{label}</span>
      {tooltip && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-slate-500 cursor-help hover:text-slate-600" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="z-[99999] max-w-sm bg-white border border-slate-200 shadow-md"
          >
            <p className="text-sm text-slate-600">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <SelectDropdownTrigger
            displayText={displayText}
            placeholderClass={placeholderClass}
            triggerClass={triggerClass}
            disabled={disabled}
            id={id}
            triggerRef={triggerRef}
          />
        </DropdownMenuTrigger>
        <SelectDropdownContent
          label={label}
          setOpen={setOpen}
          showSearch={showSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          selectedValues={selectedValues}
          displayOptions={displayOptions}
          handleToggle={handleToggle}
          handleClearAll={handleClearAll}
          dropdownWidth={dropdownWidth}
          alignOffset={alignOffset}
        />
      </DropdownMenu>
    </div>
  );
}
