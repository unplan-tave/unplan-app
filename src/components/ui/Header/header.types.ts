import { type ReactNode } from 'react';
import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { type ConditionType } from '@/components/ui/Tag';

export interface HeaderProgressProps {
  progress?: number;
  onBackPress?: () => void;
  showBackButton?: boolean;
  showProgress?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface HeaderBackProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
}

export interface HeaderCancelProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export interface HeaderSearchProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export interface HeaderHomeProps extends HeaderProps {
  greeting?: string;
}

export interface HeaderConditionProps {
  title: string;
  condition: ConditionType;
  style?: StyleProp<ViewStyle>;
}

export interface HeaderCardListProps {
  title: string;
  count?: number;
  actionLabel?: string;
  onActionPress?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
}

export interface HeaderStatusSummaryProps {
  label: string;
  value: string | number;
  caption?: string;
  style?: StyleProp<ViewStyle>;
}
