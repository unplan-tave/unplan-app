import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Typography } from '@/components/ui/Typography';
import { CONDITION_CALENDAR_WEEKDAY_LABELS } from '@/constants/condition-ui';
import { colors, radius, spacing } from '@/constants/theme';
import { toConditionCalendarWeeks } from '@/domains/condition/calendar';
import {
  getConditionCalendarSelectionPosition,
  type ConditionCalendarDay,
} from '@/domains/condition/period';

import type { ConditionPeriodMode } from '@/domains/condition/model';

interface ConditionCalendarModalProps {
  visible: boolean;
  title: string;
  days: ConditionCalendarDay[];
  selectedDate: Date;
  periodMode: ConditionPeriodMode;
  canGoNext: boolean;
  onSelectDate: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onClose: () => void;
}

/** 컨디션 탭 전용 월력 모달. Figma 2337:172826의 블러 패널과 원형 날짜 셀을 따릅니다. */
export function ConditionCalendarModal({
  visible,
  title,
  days,
  selectedDate,
  periodMode,
  canGoNext,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onClose,
}: ConditionCalendarModalProps) {
  return (
    <Modal visible={visible} contentStyle={styles.modal} onClose={onClose}>
      <BlurView intensity={28} tint="light" style={styles.panel}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="이전 달"
            accessibilityRole="button"
            hitSlop={spacing[2]}
            style={styles.monthButton}
            onPress={onPreviousMonth}
          >
            <Icon name="arrowLeft" size={24} color={colors.gray[900]} />
          </Pressable>
          <Typography variant="titleS" color={colors.gray[900]} style={styles.title}>
            {title}
          </Typography>
          <Pressable
            accessibilityLabel="다음 달"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canGoNext }}
            disabled={!canGoNext}
            hitSlop={spacing[2]}
            style={styles.monthButton}
            onPress={onNextMonth}
          >
            <Icon name="arrowRight" size={24} color={colors.gray[900]} disabled={!canGoNext} />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {CONDITION_CALENDAR_WEEKDAY_LABELS.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Typography variant="caption" color={colors.gray[500]} align="center">
                {label}
              </Typography>
            </View>
          ))}
        </View>

        <View style={styles.dateGrid}>
          {toConditionCalendarWeeks(days).map((week) => (
            <View
              key={week.map((day) => day?.date?.toISOString() ?? 'empty').join('-')}
              style={styles.dateRow}
            >
              {week.map((day, index) => {
                if (day == null) {
                  return <View key={`empty-${index}`} style={styles.dateCell} />;
                }

                const selectionPosition = getConditionCalendarSelectionPosition(
                  day.date,
                  selectedDate,
                  periodMode,
                );
                const isRangeSelected = selectionPosition != null;
                const isRangeEndpoint =
                  selectionPosition === 'single' ||
                  selectionPosition === 'start' ||
                  selectionPosition === 'end';

                return (
                  <Pressable
                    key={day.date.toISOString()}
                    accessibilityLabel={`${day.date.getMonth() + 1}월 ${day.date.getDate()}일`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isRangeSelected, disabled: day.disabled }}
                    disabled={day.disabled}
                    style={({ pressed }) => [
                      styles.dateCell,
                      isRangeSelected && styles.rangeCell,
                      isRangeEndpoint && styles.rangeEndpointCell,
                      day.disabled && styles.disabledCell,
                      pressed && !day.disabled && styles.pressedCell,
                    ]}
                    onPress={() => onSelectDate(day.date)}
                  >
                    <Typography
                      variant="bodyM"
                      color={
                        day.disabled
                          ? colors.gray[500]
                          : isRangeEndpoint
                            ? colors.gray.white
                            : isRangeSelected
                              ? colors.chip.selectedText
                              : colors.gray.white
                      }
                      align="center"
                    >
                      {day.date.getDate()}
                    </Typography>
                    {day.isToday ? <View style={styles.todayFocusDot} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    maxWidth: 280,
    padding: 0,
    borderRadius: radius.sm,
    backgroundColor: colors.alpha.transparent,
  },
  panel: {
    gap: spacing[3],
    overflow: 'hidden',
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray.white,
    borderRadius: radius.sm,
    backgroundColor: colors.alpha.white50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: spacing[6],
    height: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  dateGrid: {
    gap: spacing[1],
  },
  dateRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  rangeCell: {
    borderRadius: 0,
    backgroundColor: colors.alpha.primary20,
  },
  rangeEndpointCell: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  disabledCell: {
    opacity: 0.72,
  },
  pressedCell: {
    opacity: 0.72,
  },
  todayFocusDot: {
    position: 'absolute',
    bottom: spacing[1],
    width: radius.xs,
    height: radius.xs,
    borderRadius: radius.full,
    backgroundColor: colors.gray.white,
  },
});
