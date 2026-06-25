import { type ReactNode } from 'react';
import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/ui/Icon';

export interface FooterProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface FooterCTAProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface FooterGNBItem {
  label: string;
  value: string;
  iconName?: IconName;
  disabled?: boolean;
}

export interface FooterGNBProps {
  items: FooterGNBItem[];
  value?: string;
  onChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}
