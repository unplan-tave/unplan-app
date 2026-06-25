import { type StyleProp, type ViewStyle } from 'react-native';

export interface AppIconProps {
  size?: number;
  accessibilityLabel?: string;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}
