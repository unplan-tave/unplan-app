import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { type ConditionType } from '@/components/ui/Tag';

export interface ConditionCardProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  description?: string;
  condition: ConditionType;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
