import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, fontFamilyWeight, radius, spacing } from '@/constants/theme';

type HomeCalendarViewMode = 'weekly' | 'monthly';

interface HomeCalendarDay {
  date: Date;
  dateValue: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasMemo: boolean;
  scheduleCount: number;
  previewTitles: string[];
}

interface HomeCalendarViewProps {
  mode: HomeCalendarViewMode;
  days: HomeCalendarDay[];
  onSelectDate: (date: Date) => void;
}

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const WEEK_LENGTH = 7;
const CALENDAR_CELL_HEIGHT = 60;
const DATE_BADGE_SIZE = 28;
const MONTHLY_DATE_BADGE_SIZE = 26;
const MAX_WEEKLY_PREVIEW_COUNT = 2;

export function HomeCalendarView({ mode, days, onSelectDate }: HomeCalendarViewProps) {
  if (mode === 'weekly') {
    return (
      <View style={styles.container}>
        <View style={styles.weekRow}>
          {days.map((day, index) => (
            <WeeklyDayColumn
              key={day.dateValue}
              day={day}
              weekday={WEEKDAY_LABELS[index % WEEK_LENGTH] ?? ''}
              onPress={() => onSelectDate(day.date)}
            />
          ))}
        </View>
      </View>
    );
  }

  const weeks = chunkByWeek(days);

  return (
    <View style={styles.container}>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((weekday) => (
          <Typography
            key={weekday}
            variant="caption"
            color={colors.gray[500]}
            align="center"
            style={styles.weekdayLabel}
          >
            {weekday}
          </Typography>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]?.dateValue ?? ''} style={styles.weekRow}>
          {week.map((day) => (
            <MonthlyDayCell key={day.dateValue} day={day} onPress={() => onSelectDate(day.date)} />
          ))}
        </View>
      ))}
    </View>
  );
}

function WeeklyDayColumn({
  day,
  weekday,
  onPress,
}: {
  day: HomeCalendarDay;
  weekday: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${day.day}일`}
      accessibilityRole="button"
      accessibilityState={{ selected: day.isSelected }}
      style={({ pressed }) => [styles.weeklyColumn, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Typography variant="caption" color={colors.gray[300]} align="center">
        {weekday}
      </Typography>
      <View
        style={[
          styles.dateBadge,
          day.isToday && styles.todayBadge,
          day.isSelected && styles.selectedBadge,
        ]}
      >
        <Typography
          variant="bodyS"
          align="center"
          color={getDateColor(day)}
          style={[styles.dateText, day.hasMemo && styles.memoDateText]}
        >
          {day.day}
        </Typography>
      </View>
      <View style={styles.weeklyScheduleList}>
        {day.previewTitles.slice(0, MAX_WEEKLY_PREVIEW_COUNT).map((title, index) => (
          <View key={`${day.dateValue}-${index}`} style={styles.weeklyScheduleCell}>
            <Typography variant="caption" color={colors.gray[700]} align="center" numberOfLines={2}>
              {title}
            </Typography>
          </View>
        ))}
        {day.previewTitles.length > MAX_WEEKLY_PREVIEW_COUNT ? (
          <Typography variant="caption" color={colors.gray[500]} align="center" numberOfLines={1}>
            +{day.previewTitles.length - MAX_WEEKLY_PREVIEW_COUNT}개 더보기
          </Typography>
        ) : null}
      </View>
    </Pressable>
  );
}

function MonthlyDayCell({ day, onPress }: { day: HomeCalendarDay; onPress: () => void }) {
  const showGlassBackground = day.scheduleCount > 0;

  return (
    <Pressable
      accessibilityLabel={`${day.day}일`}
      accessibilityRole="button"
      accessibilityState={{ selected: day.isSelected }}
      style={({ pressed }) => [
        styles.monthlyCell,
        showGlassBackground && styles.glassCell,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.monthlyDateBadge,
          day.isToday && styles.todayBadge,
          day.isSelected && styles.selectedBadge,
        ]}
      >
        <Typography
          variant="bodyM"
          align="center"
          color={getDateColor(day)}
          style={styles.monthlyDateText}
        >
          {day.day}
        </Typography>
      </View>
      {day.scheduleCount > 0 ? (
        <Typography variant="caption" color={colors.gray[500]} align="center" numberOfLines={1}>
          {formatCountLabel(day.scheduleCount)}
        </Typography>
      ) : null}
    </Pressable>
  );
}

function getDateColor(day: HomeCalendarDay) {
  if (day.isSelected) {
    return colors.gray.white;
  }

  if (day.isToday) {
    return colors.chip.selectedText;
  }

  if (!day.inCurrentMonth) {
    return colors.gray[500];
  }

  return colors.gray[600];
}

function chunkByWeek(days: HomeCalendarDay[]) {
  const weeks: HomeCalendarDay[][] = [];

  for (let index = 0; index < days.length; index += WEEK_LENGTH) {
    weeks.push(days.slice(index, index + WEEK_LENGTH));
  }

  return weeks;
}

function formatCountLabel(count: number) {
  return count > 99 ? '99+개' : `${count}개`;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 260,
    left: spacing[3],
    right: spacing[3],
    zIndex: 2,
    width: 'auto',
    maxWidth: 369,
    alignSelf: 'center',
    gap: spacing[1],
  },
  weekRow: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  weekdayLabel: {
    flex: 1,
  },
  weeklyColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  weeklyScheduleList: {
    alignSelf: 'stretch',
    gap: spacing[1],
  },
  weeklyScheduleCell: {
    height: CALENDAR_CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
  dateBadge: {
    width: DATE_BADGE_SIZE,
    height: DATE_BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  todayBadge: {
    backgroundColor: colors.alpha.primary20,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
  },
  dateText: {
    fontFamily: fontFamilyWeight.bold,
    fontWeight: '700',
  },
  memoDateText: {
    textDecorationLine: 'underline',
  },
  monthlyCell: {
    flex: 1,
    height: CALENDAR_CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.xs,
  },
  glassCell: {
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
  monthlyDateBadge: {
    minWidth: MONTHLY_DATE_BADGE_SIZE,
    height: MONTHLY_DATE_BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  monthlyDateText: {
    fontFamily: fontFamilyWeight.bold,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
