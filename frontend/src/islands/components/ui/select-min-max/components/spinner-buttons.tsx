import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SpinnerButtonsProps {
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  wrapClass: string;
  btnClass: string;
}

export function SpinnerButtons({
  onIncrement,
  onDecrement,
  disabled = false,
  wrapClass,
  btnClass,
}: SpinnerButtonsProps) {
  return (
    <div className={wrapClass}>
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onIncrement();
        }}
        onMouseDown={e => e.preventDefault()}
        className={btnClass}
      >
        <ChevronUp className="h-2.5 w-2.5" />
      </button>
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onDecrement();
        }}
        onMouseDown={e => e.preventDefault()}
        className={btnClass}
      >
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}
