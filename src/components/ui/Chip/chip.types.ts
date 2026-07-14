import { type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/ui/Icon';

/** `pill`은 기본 둥근 칩, `square`는 Figma 컨디션 회복 수단 칩(모서리 4px)입니다. */
export type ChipVariant = 'pill' | 'square';

export interface ChipProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  selected?: boolean;
  variant?: ChipVariant;
  iconName?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
