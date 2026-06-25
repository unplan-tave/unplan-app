import { type ReactNode } from 'react';
import {
  type ModalProps,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { type TextFieldProps } from '@/components/ui/TextField';

export interface BottomSheetProps extends Omit<ModalProps, 'visible' | 'children'> {
  visible: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  onClose?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}

export interface BottomSheetHandleProps {
  style?: StyleProp<ViewStyle>;
}

export interface ActionListBottomSheetItem {
  label: string;
  caption?: string;
  disabled?: boolean;
  destructive?: boolean;
  onPress?: () => void;
}

export interface ActionListBottomSheetProps extends Omit<BottomSheetProps, 'children'> {
  items: ActionListBottomSheetItem[];
}

export interface AddScheduleBottomSheetProps extends Omit<BottomSheetProps, 'children'> {
  titleFieldProps: TextFieldProps;
  timeFieldProps?: TextFieldProps;
  onAddPress?: PressableProps['onPress'];
  addLabel?: string;
}

export interface TimePickerBottomSheetProps extends Omit<BottomSheetProps, 'children'> {
  value: string;
  options: string[];
  onSelect?: (value: string) => void;
  selectedTextStyle?: StyleProp<TextStyle>;
}
