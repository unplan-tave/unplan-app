import { type StyleProp, type ViewStyle } from 'react-native';

import { type TextFieldProps } from '@/components/ui/TextField';

export interface InputProps {
  label: string;
  fieldProps: TextFieldProps;
  addFieldProps?: TextFieldProps;
  recommendation?: string;
  style?: StyleProp<ViewStyle>;
}
