import { type StyleProp, type ViewStyle } from 'react-native';

export interface BrandLogoProps {
  color?: string;
  size?: 'medium' | 'large';
  variant?: 'symbol' | 'wordmark' | 'combined';
  style?: StyleProp<ViewStyle>;
}
