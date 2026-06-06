import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export interface TimeStepperProps {
  label?: string;
  alertMessage?: string;
  disabled?: boolean;
  onDecrease?: PressableProps['onPress'];
  onIncrease?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
}
