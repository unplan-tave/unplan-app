import { type ReactNode } from 'react';
import {
  type ModalProps as RNModalProps,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { type ProgressSegmentValue } from '@/components/ui/ProgressSegment';
import { type TextFieldProps } from '@/components/ui/TextField';

export interface ModalProps extends Omit<RNModalProps, 'visible' | 'children'> {
  visible: boolean;
  children: ReactNode;
  onClose?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  overlayVariant?: 'default' | 'dimmed';
}

export interface ModalActionsProps {
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  onConfirm?: PressableProps['onPress'];
  onCancel?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: PressableProps['onPress'];
}

export interface ProgressModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  description?: string;
  progress: number;
}

export interface StepperModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  label?: string;
  onDecrease?: PressableProps['onPress'];
  onIncrease?: PressableProps['onPress'];
}

export interface ScheduleEditModalProps extends Omit<ModalProps, 'children'> {
  title?: string;
  titleFieldProps: TextFieldProps;
  startFieldProps?: TextFieldProps;
  endFieldProps?: TextFieldProps;
  onSave?: PressableProps['onPress'];
}

export interface CardDetailModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  description?: string;
  status?: ProgressSegmentValue;
  onStatusChange?: (value: ProgressSegmentValue) => void;
}
