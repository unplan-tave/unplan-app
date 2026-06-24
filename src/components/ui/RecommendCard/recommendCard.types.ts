import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/ui/Icon';

export interface RecommendCardProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  description?: string;
  caption?: string;
  iconName?: IconName;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
