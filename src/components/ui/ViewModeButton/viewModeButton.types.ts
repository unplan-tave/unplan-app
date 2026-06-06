import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export type ViewMode = 'weekly' | 'monthly' | 'daily';

export interface ViewModeButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  mode: ViewMode;
  label?: string;
  style?: StyleProp<ViewStyle>;
}
