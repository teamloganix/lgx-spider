import React from 'react';
import type { SelectMinMaxProps } from './types';
import { useSelectMinMax } from './utils/use-select-min-max';
import { SelectMinMaxHeader } from './components/SelectMinMaxHeader';
import { SelectMinMaxInputs } from './components/SelectMinMaxInputs';

export type { SelectMinMaxLogo } from './types';

export function SelectMinMax(props: SelectMinMaxProps) {
  const {
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
  } = useSelectMinMax(props);

  return (
    <div
      onClick={handleContainerClick}
      className={
        'flex items-center gap-2 rounded-full border border-slate-300 ' +
        'bg-white px-3 h-10 hover:bg-slate-50/50 transition-colors ' +
        'cursor-pointer shadow-none w-full sm:w-auto'
      }
      style={
        finalContainerMaxWidth
          ? ({
              maxWidth: `min(100%, ${finalContainerMaxWidth})`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <SelectMinMaxHeader
        logo={props.logo}
        label={props.label}
        tooltip={props.tooltip}
        hasValue={hasValue}
        disabled={disabled}
        onClear={handleClear}
      />
      <SelectMinMaxInputs
        prefix={prefix}
        formatThousandsProp={formatThousandsProp}
        min={min}
        max={max}
        minInputMax={minInputMax}
        maxInputMax={maxInputMax}
        step={step}
        disabled={disabled}
        value={value}
        isInvalid={isInvalid}
        isDesktop={isDesktop}
        gapClass={gapClass}
        finalInputWidth={finalInputWidth}
        finalInputContainerMaxWidth={finalInputContainerMaxWidth}
        minInputRef={minInputRef}
        maxInputRef={maxInputRef}
        inputContainerRef={inputContainerRef}
        handleMinChange={handleMinChange}
        handleMaxChange={handleMaxChange}
        handleMinKeyDown={handleMinKeyDown}
        handleMaxKeyDown={handleMaxKeyDown}
        handleMinStep={handleMinStep}
        handleMaxStep={handleMaxStep}
        spinnerWrapClass={spinnerWrapClass}
        spinnerBtnClass={spinnerBtnClass}
      />
    </div>
  );
}
