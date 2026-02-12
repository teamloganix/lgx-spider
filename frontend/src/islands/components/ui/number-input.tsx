import React, { useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@islands/lib/utils';
import { Input } from './input';

interface NumberInputProps {
  value?: number;
  onChange: (_value: number | undefined) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  borderless?: boolean;
  onStep?: (_value: number) => void;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  disabled = false,
  placeholder = '0',
  className,
  onBlur,
  borderless = false,
  onStep,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    if (inputValue === '') {
      onChange(undefined);
      return;
    }
    const numValue = Number(inputValue);
    if (!Number.isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleStep = (delta: number) => {
    const currentValue = value ?? min;
    const newValue = Math.max(min, Math.min(max, currentValue + delta));
    const valueToSet = newValue === min && value === undefined ? undefined : newValue;
    onChange(valueToSet);
    if (valueToSet !== undefined) onStep?.(valueToSet);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <div className={cn('relative flex items-stretch', className)}>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value !== undefined ? value.toString() : ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          'input-hide-native-spinner w-full h-8 text-sm pr-6',
          borderless && 'border-0 bg-transparent shadow-none'
        )}
        maxLength={4}
      />
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 flex flex-col',
          !borderless && 'border-l border-slate-200'
        )}
      >
        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={disabled || (value !== undefined && value >= max)}
          className={cn(
            'flex-1 flex items-center justify-center px-1',
            !borderless && 'border-b border-slate-200',
            'hover:bg-slate-50 transition-colors',
            disabled || (value !== undefined && value >= max)
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          )}
        >
          <ChevronUp className="h-3 w-3 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={disabled || (value !== undefined && value <= min)}
          className={cn(
            'flex-1 flex items-center justify-center px-1',
            'hover:bg-slate-50 transition-colors',
            disabled || (value !== undefined && value <= min)
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          )}
        >
          <ChevronDown className="h-3 w-3 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
