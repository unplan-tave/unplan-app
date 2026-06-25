import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type CalendarDayCellProps } from './calendar.types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarDayCell({
  date,
  label,
  count = 0,
  countLabel,
  selected = false,
  disabled = false,
  onPress,
  style,
}: CalendarDayCellProps) {
  const dateLabel = label ?? String(date.getDate());
  const accessibilityLabel = `${WEEKDAY_LABELS[date.getDay()]}요일 ${dateLabel}일`;
  const visibleCountLabel =
    countLabel ?? (count > 0 ? `${count > 99 ? '99+' : String(count)}개` : undefined);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={() => onPress?.(date)}
    >
      <View style={[styles.date, selected && styles.selectedDate]}>
        <Typography
          variant="bodyM"
          color={selected ? colors.gray.white : disabled ? colors.gray[300] : colors.gray[600]}
          align="center"
          numberOfLines={1}
          style={styles.dateText}
        >
          {dateLabel}
        </Typography>
      </View>
      {visibleCountLabel ? (
        <Typography
          variant="caption"
          color={selected ? colors.gray[600] : disabled ? colors.gray[300] : colors.gray[500]}
          align="center"
          numberOfLines={1}
          style={styles.count}
        >
          {visibleCountLabel}
        </Typography>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: radius.xs,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  date: {
    width: 35,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDate: {
    width: 26,
    borderRadius: 17,
    backgroundColor: colors.primary,
  },
  dateText: {
    fontWeight: '700',
  },
  count: {
    width: 35,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});
