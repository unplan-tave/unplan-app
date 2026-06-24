import { type StyleProp, type ViewStyle } from 'react-native';

export interface StatusBarProps {
  time?: string;
  darkContent?: boolean;
  showDynamicIsland?: boolean;
  style?: StyleProp<ViewStyle>;
}
