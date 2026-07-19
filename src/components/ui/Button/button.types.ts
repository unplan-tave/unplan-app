import { type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'glass'
  | 'conditionSecondary'
  | 'conditionPrimary';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
