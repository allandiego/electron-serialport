import { NativeSelectProps as BaseSelectProps } from '@material-ui/core';

export interface SelectProps extends BaseSelectProps {
  label?: string;
  multiple?: boolean;
}
