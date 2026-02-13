import React from 'react';
import { Check, Info } from 'lucide-react';
import { cn } from '@islands/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface CheckboxProps {
  label: string;
  value?: boolean | null;
  onValueChange: (_value: boolean | null | undefined) => void;
  disabled?: boolean;
  id?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export function Checkbox({
  label,
  value,
  onValueChange,
  disabled = false,
  id,
  icon,
  tooltip,
  className,
}: CheckboxProps) {
  const handleToggle = () => {
    if (disabled) {
      return;
    }
    if (value === true) {
      onValueChange(false);
    } else {
      onValueChange(true);
    }
  };

  const isChecked = value === true;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      id={id}
      className={cn(
        'flex items-center gap-2 border rounded-full h-10 px-3 ' +
          'transition-colors bg-white border-slate-300 text-slate-600',
        disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer',
        className
      )}
    >
      {isChecked && (
        <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center shrink-0">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      {!isChecked && <div className="w-4 h-4 border border-slate-300 rounded shrink-0" />}
      {icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      <span className="whitespace-nowrap text-sm font-medium text-slate-600">{label}</span>
      {tooltip && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-slate-500 cursor-help hover:text-slate-600 shrink-0" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="z-[99999] max-w-sm bg-white border border-slate-200 shadow-md"
          >
            <p className="text-sm text-slate-700">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </button>
  );
}
