export interface OptionModel {
  label: string;
  value: any;
  color?: string;
  disabled?: boolean;
  [key: string]: any; // Allow additional properties
}

