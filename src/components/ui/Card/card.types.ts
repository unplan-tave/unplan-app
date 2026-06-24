import { type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { type ConditionType } from '@/components/ui/Tag';

export interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface CardTagItem {
  label: string;
  variant?: 'condition' | 'personal';
  condition?: ConditionType;
}

export interface CardTagListProps {
  tags: CardTagItem[];
  maxVisible?: number;
  style?: StyleProp<ViewStyle>;
  moreTextStyle?: StyleProp<TextStyle>;
}
