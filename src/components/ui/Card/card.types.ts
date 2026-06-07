import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}
