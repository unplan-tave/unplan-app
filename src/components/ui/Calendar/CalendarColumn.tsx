import { StyleSheet, View } from 'react-native';

import { type CalendarColumnProps } from './calendar.types';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarScheduleCell } from './CalendarScheduleCell';

export function CalendarColumn({ day, selected = false, onPress, style }: CalendarColumnProps) {
  return (
    <View style={[styles.column, style]}>
      <CalendarDayCell
        date={day.date}
        label={day.label}
        selected={selected}
        disabled={day.disabled}
        onPress={onPress}
      />
      <View style={styles.schedules}>
        {day.schedules?.map((schedule) => (
          <CalendarScheduleCell key={schedule.id} schedule={schedule} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    minWidth: 96,
    gap: 8,
  },
  schedules: {
    gap: 6,
  },
});
