import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export interface ScreenLayoutProps {
  children: ReactNode;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  useSafeArea?: boolean;
}
