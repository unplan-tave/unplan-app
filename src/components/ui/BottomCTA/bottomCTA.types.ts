import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export interface BottomCTAProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  caption?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
