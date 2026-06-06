import {
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

export type TextFieldVariant = 'short' | 'long' | 'add' | 'time' | 'duration' | 'reminder';

interface BaseTextFieldProps {
  variant?: TextFieldVariant;
  width?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface EditableTextFieldProps
  extends BaseTextFieldProps, Omit<TextInputProps, 'style' | 'editable'> {
  variant?: 'short' | 'long';
  disabled?: boolean;
}

export interface ActionTextFieldProps
  extends BaseTextFieldProps, Omit<PressableProps, 'style' | 'children' | 'disabled'> {
  variant: 'add' | 'time' | 'duration' | 'reminder';
  label?: string;
  rightLabel?: string;
  disabled?: boolean;
}

export type TextFieldProps = EditableTextFieldProps | ActionTextFieldProps;
