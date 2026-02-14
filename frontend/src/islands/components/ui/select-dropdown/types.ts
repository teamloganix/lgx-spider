import type React from 'react';

export interface SelectDropdownOption {
  value: string;
  label: string;
  render?: (_option: SelectDropdownOption, _isChecked: boolean) => React.ReactNode;
}

export interface SelectDropdownProps {
  label: string;
  tooltip?: string;
  options: SelectDropdownOption[];
  value: string[];
  onValueChange: (_value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  showSearch?: boolean;
  singleSelect?: boolean;
  lockedValues?: string[];
}
