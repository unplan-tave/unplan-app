import { type StyleProp, type ViewStyle } from 'react-native';

export interface HeaderProgressProps {
  progress: number;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
}
