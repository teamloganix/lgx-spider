import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../button';

interface SelectDropdownTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  displayText: string;
  placeholderClass: string;
  triggerClass: string;
  disabled?: boolean;
  id?: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

function mergeRefs(
  triggerRef: React.RefObject<HTMLButtonElement | null>,
  ref: React.Ref<HTMLButtonElement | null>
) {
  return (el: HTMLButtonElement | null) => {
    const trigger = triggerRef as React.MutableRefObject<HTMLButtonElement | null>;
    trigger.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      const r = ref as React.MutableRefObject<HTMLButtonElement | null>;
      r.current = el;
    }
  };
}

export const SelectDropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectDropdownTriggerProps
>(
  (
    { displayText, placeholderClass, triggerClass, disabled = false, id, triggerRef, ...rest },
    ref
  ) => {
    const setRef = useCallback(mergeRefs(triggerRef, ref), [triggerRef, ref]);

    return (
      <Button
        ref={setRef}
        type="button"
        id={id}
        variant="ghost"
        size="sm"
        className={`${triggerClass} ${placeholderClass}`}
        disabled={disabled}
        {...rest}
      >
        <span className="truncate text-left">{displayText}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      </Button>
    );
  }
);
