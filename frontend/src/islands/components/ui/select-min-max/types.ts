export interface SelectMinMaxLogo {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  backgroundColor?: string;
}

export interface SelectMinMaxProps {
  label: string;
  tooltip?: string;
  logo?: SelectMinMaxLogo;
  value?: { min?: number; max?: number };
  onValueChange: (_value: { min?: number; max?: number } | undefined) => void;
  prefix?: string;
  min?: number;
  max?: number;
  minInputMax?: number;
  maxInputMax?: number;
  step?: number;
  maxWidth?: string;
  sanitizeInput?: boolean;
  inputGap?: 'sm' | 'md';
  inputContainerMaxWidth?: string;
  inputWidth?: string;
  containerMaxWidth?: string;
  disabled?: boolean;
  formatThousands?: boolean;
}
