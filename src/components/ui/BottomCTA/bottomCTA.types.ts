import { type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export interface BottomCTAProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  caption?: string | null;
  onCaptionPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
