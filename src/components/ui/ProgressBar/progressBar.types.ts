import { type StyleProp, type ViewStyle } from 'react-native';

export interface ProgressBarProps {
  value: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
}
