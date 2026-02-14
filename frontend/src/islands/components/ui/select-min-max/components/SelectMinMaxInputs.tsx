import React from 'react';
import { Input } from '../../input';
import { formatThousands } from '../utils/format-min-max';
import { SpinnerButtons } from './spinner-buttons';

const hideSpinnerClass =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none ' +
  '[&::-webkit-inner-spin-button]:appearance-none';

interface SelectMinMaxInputsProps {
  prefix?: string;
  formatThousandsProp: boolean;
  min: number;
  max?: number;
  minInputMax?: number;
  maxInputMax?: number;
  step: number;
  disabled: boolean;
  value?: { min?: number; max?: number };
  isInvalid: boolean;
  isDesktop: boolean;
  gapClass: string;
  finalInputWidth: string;
  finalInputContainerMaxWidth: string | undefined;
  minInputRef: React.RefObject<HTMLInputElement | null>;
  maxInputRef: React.RefObject<HTMLInputElement | null>;
  inputContainerRef: React.RefObject<HTMLDivElement | null>;
  handleMinChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMinKeyDown: (_e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleMaxKeyDown: (_e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleMinStep: (_delta: number) => void;
  handleMaxStep: (_delta: number) => void;
  spinnerWrapClass: string;
  spinnerBtnClass: string;
}

export function SelectMinMaxInputs({
  prefix,
  formatThousandsProp,
  min,
  max,
  minInputMax,
  maxInputMax,
  step,
  disabled,
  value,
  isInvalid,
  isDesktop,
  gapClass,
  finalInputWidth,
  finalInputContainerMaxWidth,
  minInputRef,
  maxInputRef,
  inputContainerRef,
  handleMinChange,
  handleMaxChange,
  handleMinKeyDown,
  handleMaxKeyDown,
  handleMinStep,
  handleMaxStep,
  spinnerWrapClass,
  spinnerBtnClass,
}: SelectMinMaxInputsProps) {
  const invalidClass = isInvalid ? '!border !border-red-500' : '';
  const inputContainerStyle =
    finalInputContainerMaxWidth && isDesktop
      ? ({
          maxWidth: `min(100%, ${finalInputContainerMaxWidth})`,
        } as React.CSSProperties)
      : undefined;

  const spinnerButtons = (onInc: () => void, onDec: () => void) => (
    <SpinnerButtons
      onIncrement={onInc}
      onDecrement={onDec}
      disabled={disabled}
      wrapClass={spinnerWrapClass}
      btnClass={spinnerBtnClass}
    />
  );

  const inputClass = `w-full h-8 text-sm border-0 shadow-none pr-6 ${hideSpinnerClass} ${invalidClass}`;

  if (prefix) {
    return (
      <div
        ref={inputContainerRef}
        className={`flex ${gapClass} flex-[0.8] sm:flex-1 min-w-0 max-w-full`}
        style={inputContainerStyle}
      >
        <div className={`relative flex-1 min-w-0 flex items-stretch ${finalInputWidth}`}>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 z-[1]">
            {prefix}
          </span>
          <Input
            ref={minInputRef}
            type="number"
            min={min.toString()}
            max={minInputMax?.toString()}
            step={step.toString()}
            placeholder="Min"
            value={value?.min !== undefined ? value.min : ''}
            onChange={handleMinChange}
            onKeyDown={handleMinKeyDown}
            disabled={disabled}
            className={`pl-6 ${inputClass}`}
            onClick={e => e.stopPropagation()}
          />
          {spinnerButtons(
            () => handleMinStep(step),
            () => handleMinStep(-step)
          )}
        </div>
        <div className={`relative flex-1 min-w-0 flex items-stretch ${finalInputWidth}`}>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 z-[1]">
            {prefix}
          </span>
          <Input
            ref={maxInputRef}
            type="number"
            min={min.toString()}
            max={maxInputMax?.toString() ?? max?.toString()}
            step={step.toString()}
            placeholder="Max"
            value={value?.max !== undefined ? value.max : ''}
            onChange={handleMaxChange}
            onKeyDown={handleMaxKeyDown}
            disabled={disabled}
            className={`pl-6 ${inputClass}`}
            onClick={e => e.stopPropagation()}
          />
          {spinnerButtons(
            () => handleMaxStep(step),
            () => handleMaxStep(-step)
          )}
        </div>
      </div>
    );
  }

  if (formatThousandsProp) {
    return (
      <div
        ref={inputContainerRef}
        className={`flex ${gapClass} flex-[0.8] sm:flex-1 min-w-0 max-w-full`}
        style={inputContainerStyle}
      >
        <div className={`relative flex-1 min-w-0 flex items-stretch ${finalInputWidth}`}>
          <Input
            ref={minInputRef}
            type="text"
            inputMode="numeric"
            placeholder="Min"
            value={value?.min !== undefined ? formatThousands(value.min) : ''}
            onChange={handleMinChange}
            onKeyDown={handleMinKeyDown}
            disabled={disabled}
            className={inputClass}
            onClick={e => e.stopPropagation()}
          />
          {spinnerButtons(
            () => handleMinStep(step),
            () => handleMinStep(-step)
          )}
        </div>
        <div className={`relative flex-1 min-w-0 flex items-stretch ${finalInputWidth}`}>
          <Input
            ref={maxInputRef}
            type="text"
            inputMode="numeric"
            placeholder="Max"
            value={value?.max !== undefined ? formatThousands(value.max) : ''}
            onChange={handleMaxChange}
            onKeyDown={handleMaxKeyDown}
            disabled={disabled}
            className={inputClass}
            onClick={e => e.stopPropagation()}
          />
          {spinnerButtons(
            () => handleMaxStep(step),
            () => handleMaxStep(-step)
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={inputContainerRef}
      className={`flex ${gapClass} flex-[0.8] sm:flex-1 min-w-0 max-w-full`}
      style={inputContainerStyle}
    >
      <div className={`relative flex-1 min-w-0 flex items-stretch ${finalInputWidth}`}>
        <Input
          ref={minInputRef}
          type="number"
          min={min.toString()}
          max={minInputMax?.toString() ?? max?.toString()}
          placeholder="Min"
          value={value?.min !== undefined ? value.min : ''}
          onChange={handleMinChange}
          onKeyDown={handleMinKeyDown}
          disabled={disabled}
          className={inputClass}
          onClick={e => e.stopPropagation()}
        />
        {spinnerButtons(
          () => handleMinStep(step),
          () => handleMinStep(-step)
        )}
      </div>
      <div className={`relative flex-1 min-w-0 flex items-stretch ${finalInputWidth}`}>
        <Input
          ref={maxInputRef}
          type="number"
          min={min.toString()}
          max={maxInputMax?.toString() ?? max?.toString()}
          placeholder="Max"
          value={value?.max !== undefined ? value.max : ''}
          onChange={handleMaxChange}
          onKeyDown={handleMaxKeyDown}
          disabled={disabled}
          className={inputClass}
          onClick={e => e.stopPropagation()}
        />
        {spinnerButtons(
          () => handleMaxStep(step),
          () => handleMaxStep(-step)
        )}
      </div>
    </div>
  );
}
