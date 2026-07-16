import { type DimensionValue, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type CalendarProps } from './calendar.types';
import { CalendarDayCell } from './CalendarDayCell';

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_CELL_WIDTH_PERCENT = `${100 / WEEKDAY_LABELS.length}%` as DimensionValue;

export function Calendar({ days, selectedDate, onSelectDate, style }: CalendarProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.weekdays}>
        {WEEKDAY_LABELS.map((weekday) => (
          <Typography
            key={weekday}
            variant="caption"
            color={colors.gray[500]}
            align="center"
            style={styles.weekday}
          >
            {weekday}
          </Typography>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => {
          const scheduleCount = day.schedules?.length ?? 0;

          return (
            <CalendarDayCell
              key={day.date.toISOString()}
              date={day.date}
              count={scheduleCount}
              countLabel={day.countLabel}
              selected={isSameDate(day.date, selectedDate)}
              disabled={day.disabled}
              style={{ flexBasis: DAY_CELL_WIDTH_PERCENT, maxWidth: DAY_CELL_WIDTH_PERCENT }}
              onPress={onSelectDate}
            />
          );
        })}
      </View>
    </View>
  );
}

function isSameDate(date: Date, selectedDate?: Date) {
  return (
    selectedDate != null &&
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate()
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 369,
    gap: 8,
  },
  weekdays: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 4,
  },
});
