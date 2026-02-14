import React from 'react';
import { Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../tooltip';
import type { SelectMinMaxLogo } from '../types';

interface SelectMinMaxHeaderProps {
  logo?: SelectMinMaxLogo;
  label: string;
  tooltip?: string;
  hasValue: boolean;
  disabled?: boolean;
  onClear: (_e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function SelectMinMaxHeader({
  logo,
  label,
  tooltip,
  hasValue,
  disabled = false,
  onClear,
}: SelectMinMaxHeaderProps) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 flex-[0.2] sm:flex-initial self-stretch">
      {logo && (
        <div
          className="flex items-center justify-center w-10 h-6 rounded-md shrink-0 overflow-hidden"
          style={logo.backgroundColor ? { backgroundColor: logo.backgroundColor } : undefined}
        >
          <img
            src={logo.src}
            alt={logo.alt ?? ''}
            width={logo.width}
            height={logo.height}
            className={logo.className ?? 'h-5 w-5 max-w-full max-h-full object-contain'}
          />
        </div>
      )}
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="w-4 flex items-center justify-center shrink-0">
        {hasValue && !disabled ? (
          <button
            type="button"
            onClick={onClear}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={
              'self-stretch flex items-center justify-center ' +
              'cursor-pointer hover:text-slate-600 py-1'
            }
          >
            <X className="h-3.5 w-3.5 text-red-400" />
          </button>
        ) : hasValue && disabled ? (
          <div className="h-3.5 w-3.5" />
        ) : tooltip ? (
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
        ) : (
          <div className="h-3.5 w-3.5" />
        )}
      </div>
    </div>
  );
}
