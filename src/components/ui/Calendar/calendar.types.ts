import { type StyleProp, type ViewStyle } from 'react-native';

export interface CalendarScheduleItem {
  id: string;
  title: string;
  startLabel?: string;
  endLabel?: string;
  color?: string;
}

export interface CalendarDay {
  date: Date;
  label?: string;
  schedules?: CalendarScheduleItem[];
  countLabel?: string;
  disabled?: boolean;
}

export interface CalendarProps {
  days: CalendarDay[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  style?: StyleProp<ViewStyle>;
}

export interface CalendarColumnProps {
  day: CalendarDay;
  selected?: boolean;
  onPress?: (date: Date) => void;
  style?: StyleProp<ViewStyle>;
}

export interface CalendarDayCellProps {
  date: Date;
  label?: string;
  count?: number;
  countLabel?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: (date: Date) => void;
  style?: StyleProp<ViewStyle>;
}

export interface CalendarScheduleCellProps {
  schedule: CalendarScheduleItem;
  style?: StyleProp<ViewStyle>;
}
