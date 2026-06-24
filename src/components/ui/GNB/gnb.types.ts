import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/ui/Icon';

export interface GNBItemData {
  label: string;
  value: string;
  iconName?: IconName;
  disabled?: boolean;
}

export interface GNBProps {
  items?: GNBItemData[];
  value?: string;
  onChange?: (value: string) => void;
  onAddPress?: PressableProps['onPress'];
  addAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export interface GNBItemProps extends Omit<PressableProps, 'style' | 'children'> {
  item: GNBItemData;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface GNBAddButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
}
