import { type StyleProp, type ViewStyle } from 'react-native';

import { type IconName } from '@/components/ui/Icon';

export interface ChipGroupItem {
  label: string;
  value: string;
  iconName?: IconName;
  disabled?: boolean;
}

export interface ChipGroupProps {
  items: ChipGroupItem[];
  value?: string | string[];
  multiple?: boolean;
  scrollable?: boolean;
  onChange?: (value: string | string[]) => void;
  style?: StyleProp<ViewStyle>;
}
