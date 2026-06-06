import { type StyleProp, type ViewStyle } from 'react-native';

export type ProgressSegmentValue = 'todo' | 'ongoing' | 'done';

export interface ProgressSegmentOption {
  label: string;
  value: ProgressSegmentValue;
}

export interface ProgressSegmentProps {
  value?: ProgressSegmentValue;
  options?: ProgressSegmentOption[];
  onChange?: (value: ProgressSegmentValue) => void;
  style?: StyleProp<ViewStyle>;
}
