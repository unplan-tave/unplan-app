import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type CalendarScheduleCellProps } from './calendar.types';

export function CalendarScheduleCell({ schedule, style }: CalendarScheduleCellProps) {
  const timeLabel =
    schedule.startLabel && schedule.endLabel
      ? `${schedule.startLabel} - ${schedule.endLabel}`
      : schedule.startLabel;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.dot, { backgroundColor: schedule.color ?? colors.primary }]} />
      <View style={styles.text}>
        <Typography variant="bodyS" color={colors.gray[800]} numberOfLines={1}>
          {schedule.title}
        </Typography>
        {timeLabel ? (
          <Typography variant="caption" color={colors.gray[500]} numberOfLines={1}>
            {timeLabel}
          </Typography>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
});
