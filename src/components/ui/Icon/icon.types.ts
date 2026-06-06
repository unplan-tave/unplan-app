import { type StyleProp, type ViewStyle } from 'react-native';

export type IconName =
  | 'plus'
  | 'minus'
  | 'search'
  | 'maximize'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowDown'
  | 'chevronDown'
  | 'bell'
  | 'cancel'
  | 'done'
  | 'edit'
  | 'sort'
  | 'toggle';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
