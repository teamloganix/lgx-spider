import React, { useRef, useEffect, useState } from 'react';
import type { SelectMinMaxProps } from '../types';
import { parseToInteger } from './format-min-max';

export function useSelectMinMax(props: SelectMinMaxProps) {
  const {
    value,
    onValueChange,
    prefix,
    min = 0,
    max,
    minInputMax,
    maxInputMax,
    step = 1,
    sanitizeInput = false,
    inputGap = prefix ? 'md' : 'sm',
    inputContainerMaxWidth,
    inputWidth,
    containerMaxWidth,
    maxWidth,
    disabled = false,
    formatThousands: formatThousandsProp = false,
  } = props;

  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(min-width: 640px)').matches);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...value };
    if (formatThousandsProp) {
      const numValue = parseToInteger(e.target.value);
      if (numValue === undefined) {
        delete newValue.min;
      } else {
        newValue.min = minInputMax !== undefined && numValue > minInputMax ? minInputMax : numValue;
      }
    } else {
      let inputValue = e.target.value;
      if (sanitizeInput) {
        inputValue = inputValue.replace(/[^0-9]/g, '');
      }
      if (inputValue === '') {
        delete newValue.min;
      } else {
        let numValue = Number(inputValue);
        if (!Number.isNaN(numValue) && numValue >= 0) {
          if (minInputMax !== undefined && numValue > minInputMax) {
            numValue = minInputMax;
          }
          newValue.min = numValue;
        } else {
          return;
        }
      }
    }
    if (Object.keys(newValue).length === 0) {
      onValueChange(undefined);
    } else {
      onValueChange(newValue);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...value };
    if (formatThousandsProp) {
      const numValue = parseToInteger(e.target.value);
      if (numValue === undefined) {
        delete newValue.max;
      } else {
        newValue.max = maxInputMax !== undefined && numValue > maxInputMax ? maxInputMax : numValue;
      }
    } else {
      let inputValue = e.target.value;
      if (sanitizeInput) {
        inputValue = inputValue.replace(/[^0-9]/g, '');
      }
      if (inputValue === '') {
        delete newValue.max;
      } else {
        let numValue = Number(inputValue);
        if (!Number.isNaN(numValue) && numValue >= 0) {
          if (maxInputMax !== undefined && numValue > maxInputMax) {
            numValue = maxInputMax;
          }
          newValue.max = numValue;
        } else {
          return;
        }
      }
    }
    if (Object.keys(newValue).length === 0) {
      onValueChange(undefined);
    } else {
      onValueChange(newValue);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      minInputRef.current &&
      !(e.target as HTMLElement).closest('[role="tooltip"]') &&
      !(e.target as HTMLElement).closest('input') &&
      !(e.target as HTMLElement).closest('button')
    ) {
      minInputRef.current.focus();
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onValueChange(undefined);
    }
  };

  const handleMinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (maxInputRef.current && value?.max === undefined) {
        maxInputRef.current.focus();
      }
    }
  };

  const handleMaxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleMinStep = (delta: number) => {
    const current = value?.min ?? 0;
    let next = Math.max(0, current + delta);
    if (minInputMax !== undefined && next > minInputMax) {
      next = minInputMax;
    }
    const newValue = { ...value };
    if (next === 0 && value?.max === undefined) {
      delete newValue.min;
      onValueChange(Object.keys(newValue).length === 0 ? undefined : newValue);
    } else {
      newValue.min = next;
      onValueChange(newValue);
    }
  };

  const handleMaxStep = (delta: number) => {
    const current = value?.max ?? 0;
    let next = Math.max(0, current + delta);
    if (maxInputMax !== undefined && next > maxInputMax) {
      next = maxInputMax;
    }
    const newValue = { ...value };
    if (next === 0 && value?.min === undefined) {
      delete newValue.max;
      onValueChange(Object.keys(newValue).length === 0 ? undefined : newValue);
    } else {
      newValue.max = next;
      onValueChange(newValue);
    }
  };

  const hasValue = value?.min !== undefined || value?.max !== undefined;
  const isInvalid = value?.min !== undefined && value?.max !== undefined && value.min > value.max;
  const gapClass = inputGap === 'md' ? 'gap-1.5' : inputGap === 'sm' ? 'gap-1' : 'gap-1';
  const finalContainerMaxWidth = containerMaxWidth || maxWidth;
  const finalInputContainerMaxWidth = inputContainerMaxWidth || maxWidth;
  const finalInputWidth = inputWidth ?? 'sm:w-20';
  const spinnerWrapClass =
    'absolute right-0 top-0 bottom-0 w-6 flex flex-col ' +
    'pointer-events-none [&>*]:pointer-events-auto';
  const spinnerBtnClass =
    'flex-1 min-h-0 flex items-center justify-center ' +
    'disabled:opacity-50 text-[#737373] hover:text-[#525252]';

  return {
    minInputRef,
    maxInputRef,
    inputContainerRef,
    isDesktop,
    handleMinChange,
    handleMaxChange,
    handleContainerClick,
    handleClear,
    handleMinKeyDown,
    handleMaxKeyDown,
    handleMinStep,
    handleMaxStep,
    hasValue,
    isInvalid,
    gapClass,
    finalContainerMaxWidth,
    finalInputContainerMaxWidth,
    finalInputWidth,
    spinnerWrapClass,
    spinnerBtnClass,
    formatThousandsProp,
    prefix,
    min,
    max,
    minInputMax,
    maxInputMax,
    step,
    disabled,
    value,
  };
}
