import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { type TextFieldProps } from '@/components/ui/TextField';

export interface InputProps {
  label: string;
  fieldProps: TextFieldProps;
  addFieldProps?: TextFieldProps;
  recommendation?: string;
  style?: StyleProp<ViewStyle>;
}

export interface InputRowProps {
  label?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface InputRecommendationProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  style?: StyleProp<ViewStyle>;
}
