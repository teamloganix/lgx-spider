import React, { useRef, useEffect, useState } from 'react';
import type { SelectDropdownOption } from '../types';

export function useSelectDropdown(
  value: string[],
  options: SelectDropdownOption[],
  onValueChange: (_value: string[]) => void,
  open: boolean,
  setOpen: (_open: boolean) => void,
  showSearch: boolean,
  singleSelect: boolean,
  lockedValues: string[]
) {
  const selectedValues = new Set(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);
  const [alignOffset, setAlignOffset] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [frozenOrder, setFrozenOrder] = useState<SelectDropdownOption[]>([]);
  const prevOpenRef = useRef<boolean>(false);

  const updateWidthAndOffset = () => {
    if (containerRef.current && triggerRef.current) {
      setDropdownWidth(containerRef.current.offsetWidth);
      const containerRect = containerRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setAlignOffset(containerRect.left - triggerRect.left);
    }
  };

  useEffect(() => {
    updateWidthAndOffset();
    window.addEventListener('resize', updateWidthAndOffset);
    return () => {
      window.removeEventListener('resize', updateWidthAndOffset);
    };
  }, []);

  useEffect(() => {
    if (open) {
      updateWidthAndOffset();
      const timeoutId = setTimeout(updateWidthAndOffset, 0);

      if (!prevOpenRef.current) {
        const filtered = options;
        const sorted = [...filtered].sort((a, b) => {
          const aSelected = selectedValues.has(a.value);
          const bSelected = selectedValues.has(b.value);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return 0;
        });
        setFrozenOrder(sorted);
      }

      prevOpenRef.current = true;
      return () => clearTimeout(timeoutId);
    }
    prevOpenRef.current = false;
  }, [open, options, selectedValues]);

  const handleToggle = (optionValue: string) => {
    if (singleSelect) {
      const lockedSet = new Set(lockedValues);
      const currentValue = Array.from(selectedValues)[0];

      if (lockedSet.has(currentValue) && optionValue !== currentValue) {
        return;
      }

      if (selectedValues.has(optionValue)) {
        if (lockedSet.has(optionValue)) {
          return;
        }
        onValueChange([]);
      } else {
        onValueChange([optionValue]);
      }
    } else {
      const newSelected = new Set(selectedValues);
      if (newSelected.has(optionValue)) {
        const lockedSet = new Set(lockedValues);
        if (lockedSet.has(optionValue)) {
          return;
        }
        newSelected.delete(optionValue);
      } else {
        newSelected.add(optionValue);
      }
      onValueChange(Array.from(newSelected));
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest('[role="tooltip"]') &&
      !target.closest('button') &&
      target !== triggerRef.current &&
      !triggerRef.current?.contains(target)
    ) {
      setOpen(true);
    }
  };

  const getDisplayText = (placeholder: string, optionsList: SelectDropdownOption[]) => {
    if (selectedValues.size === 0) {
      return placeholder;
    }
    if (singleSelect && selectedValues.size === 1) {
      const selectedValue = Array.from(selectedValues)[0];
      const selectedOption = optionsList.find(opt => opt.value === selectedValue);
      return selectedOption?.label || placeholder;
    }
    return `${selectedValues.size} selected`;
  };

  const filteredOptions = showSearch
    ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const displayOptions =
    open && frozenOrder.length > 0 && (!showSearch || searchTerm === '')
      ? frozenOrder
      : filteredOptions;

  const handleClearAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (lockedValues.length > 0 && !singleSelect) {
      onValueChange([...lockedValues]);
    } else {
      onValueChange([]);
    }
    setSearchTerm('');
  };

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    } else if (open && searchInputRef.current && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open, showSearch]);

  return {
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
    updateWidthAndOffset,
  };
}
