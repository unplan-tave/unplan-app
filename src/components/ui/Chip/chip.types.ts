import { type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/ui/Icon';

export interface ChipProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  selected?: boolean;
  iconName?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
