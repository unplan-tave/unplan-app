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
  | 'chevronUp'
  | 'bell'
  | 'cancel'
  | 'done'
  | 'edit'
  | 'sort'
  | 'toggle'
  | 'home'
  | 'list'
  | 'condition'
  | 'setting'
  | 'warning'
  | 'refresh';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  disabled?: boolean;
  /** `warning` 전용 — badge는 채워진 원형 경고 아이콘 */
  variant?: 'default' | 'badge';
  style?: StyleProp<ViewStyle>;
}
