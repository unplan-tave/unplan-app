import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { DEFAULT_TIME_RANGE, WEEKDAY_LABELS } from '@/state/pin-card/data';
import {
  type DateTimeDraft,
  getCalendarMonth,
  isDateInDraftRange,
  sortDateValues,
  type TimeFocus,
} from '@/state/pin-card/model';

const DATE_CELL_SIZE = spacing[8];
const TIME_HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const TIME_MINUTES = ['00', '10', '20', '30', '40', '50'] as const;

export function DateTimeBottomSheet({
  visible,
  focus,
  value,
  onClose,
  onDone,
}: {
  visible: boolean;
  focus: TimeFocus;
  value: DateTimeDraft;
  onClose: () => void;
  onDone: (draft: DateTimeDraft) => void;
}) {
  const [draft, setDraft] = useState<DateTimeDraft>(value);
  const [activeTimeField, setActiveTimeField] = useState<TimeFocus>(focus);
  const [calendarBaseDate, setCalendarBaseDate] = useState(() => new Date());
  const [showTimeOrderError, setShowTimeOrderError] = useState(false);
  const calendar = getCalendarMonth(calendarBaseDate);

  useEffect(() => {
    if (visible) {
      setDraft({
        dateMode: value.dateMode,
        dateStart: value.dateStart,
        dateEnd: value.dateEnd,
        timeStart: value.timeStart,
        timeEnd: value.timeEnd,
      });
      setActiveTimeField(focus);
      setCalendarBaseDate(new Date());
      setShowTimeOrderError(false);
    }
  }, [
    focus,
    value.dateEnd,
    value.dateMode,
    value.dateStart,
    value.timeEnd,
    value.timeStart,
    visible,
  ]);

  const handleSelectDate = useCallback((dateValue: string) => {
    setDraft((prev) => {
      if (prev.dateMode === 'empty' || prev.dateMode === 'range' || prev.dateStart === dateValue) {
        return {
          ...prev,
          dateMode: 'single',
          dateStart: dateValue,
          dateEnd: '',
        };
      }

      const [dateStart, dateEnd] = sortDateValues(prev.dateStart, dateValue);

      return {
        ...prev,
        dateMode: 'range',
        dateStart,
        dateEnd,
      };
    });
  }, []);

  const handleSelectTime = useCallback(
    (timeValue: string) => {
      setDraft((prev) => ({
        ...prev,
        [activeTimeField === 'start' ? 'timeStart' : 'timeEnd']: timeValue,
      }));
      setShowTimeOrderError(false);
    },
    [activeTimeField],
  );

  const handleSelectTimePart = useCallback(
    (part: 'hour' | 'minute', nextValue: string) => {
      setDraft((prev) => {
        const fieldKey = activeTimeField === 'start' ? 'timeStart' : 'timeEnd';
        const currentTime = prev[fieldKey] || DEFAULT_TIME_RANGE[0];
        const [hour, minute] = currentTime.split(':');

        return {
          ...prev,
          [fieldKey]: part === 'hour' ? `${nextValue}:${minute}` : `${hour}:${nextValue}`,
        };
      });
      setShowTimeOrderError(false);
    },
    [activeTimeField],
  );

  const handleMoveMonth = useCallback((offset: number) => {
    setCalendarBaseDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }, []);

  const handleDone = useCallback(() => {
    if (isInvalidSameDayTimeRange(draft)) {
      setShowTimeOrderError(true);
      return;
    }

    onDone(draft);
  }, [draft, onDone]);

  return (
    <BottomSheet visible={visible} contentStyle={styles.dateTimeSheet} onClose={onClose}>
      <View style={styles.sheetHeader}>
        <Pressable
          accessibilityLabel="날짜와 시간 선택 취소"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.sheetHeaderAction, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        </Pressable>
        <Typography
          pointerEvents="none"
          variant="bodyM"
          color={colors.gray[900]}
          align="center"
          style={styles.sheetTitle}
        >
          날짜/시간
        </Typography>
        <Pressable
          accessibilityLabel="날짜와 시간 선택 완료"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.sheetHeaderAction, pressed && styles.pressed]}
          onPress={handleDone}
        >
          <Typography variant="bodyM" color={colors.primary}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.dateTimeSheetContent}>
        <Card variant="solid" accessibilityRole="none" style={styles.calendarPanel}>
          <View style={styles.calendarHeader}>
            <Pressable
              accessibilityLabel="이전 달 보기"
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
              onPress={() => handleMoveMonth(-1)}
            >
              <Typography variant="bodyM" color={colors.gray[400]}>
                ‹
              </Typography>
            </Pressable>
            <Typography variant="bodyM" color={colors.gray[800]} align="center">
              {calendar.title}
            </Typography>
            <Pressable
              accessibilityLabel="다음 달 보기"
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
              onPress={() => handleMoveMonth(1)}
            >
              <Typography variant="bodyM" color={colors.gray[400]}>
                ›
              </Typography>
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Typography
                key={label}
                variant="caption"
                color={colors.gray[400]}
                align="center"
                style={styles.weekCell}
              >
                {label}
              </Typography>
            ))}
          </View>
          <View style={styles.dateGrid}>
            {calendar.cells.map((cell) => {
              const selected =
                cell.value.length > 0 &&
                (cell.value === draft.dateStart || cell.value === draft.dateEnd);
              const inRange = isDateInDraftRange(cell.value, draft);

              return (
                <Pressable
                  key={cell.key}
                  accessibilityLabel={cell.value ? `${cell.value} 선택` : '빈 날짜'}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={cell.value.length === 0}
                  style={({ pressed }) => [
                    styles.dateCell,
                    inRange && styles.dateCellInRange,
                    selected && styles.dateCellSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleSelectDate(cell.value)}
                >
                  <Typography
                    variant="caption"
                    color={
                      selected
                        ? colors.gray.white
                        : cell.isToday
                          ? colors.primary
                          : colors.gray[700]
                    }
                    align="center"
                  >
                    {cell.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card variant="solid" accessibilityRole="none" style={styles.timePanel}>
          <TimeDraftRow
            label="시작 시간"
            value={draft.timeStart}
            selected={activeTimeField === 'start'}
            filled={draft.timeStart.length > 0}
            error={showTimeOrderError}
            onPress={() => {
              setActiveTimeField('start');
              setShowTimeOrderError(false);
            }}
          />
          <View style={styles.divider} />
          <TimeDraftRow
            label="종료 시간"
            value={draft.timeEnd}
            selected={activeTimeField === 'end'}
            filled={draft.timeEnd.length > 0}
            error={showTimeOrderError}
            onPress={() => {
              setActiveTimeField('end');
              setShowTimeOrderError(false);
            }}
          />
          {showTimeOrderError ? (
            <View style={styles.errorBox}>
              <Typography variant="bodyS" color={colors.gray.white} style={styles.errorText}>
                시작 시간이 종료 시간보다 늦어요
              </Typography>
              <Pressable
                accessibilityLabel="시간 오류 확인"
                accessibilityRole="button"
                style={({ pressed }) => [styles.errorConfirm, pressed && styles.pressed]}
                onPress={() => setShowTimeOrderError(false)}
              >
                <Typography variant="bodyS" color={colors.gray.white}>
                  확인
                </Typography>
              </Pressable>
            </View>
          ) : null}
          <TimeWheel
            value={activeTimeField === 'start' ? draft.timeStart : draft.timeEnd}
            onSelectPart={handleSelectTimePart}
            onSelectPreset={handleSelectTime}
          />
        </Card>
      </View>
    </BottomSheet>
  );
}

function TimeDraftRow({
  label,
  value,
  selected,
  filled,
  error,
  onPress,
}: {
  label: string;
  value: string;
  selected: boolean;
  filled: boolean;
  error: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 선택`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.timeDraftRow,
        selected && styles.timeDraftRowSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Typography variant="bodyM" color={colors.gray[800]}>
        {label}
      </Typography>
      <Typography
        variant="bodyM"
        color={error ? colors.secondary : selected && filled ? colors.primary : colors.gray[400]}
      >
        {value.length > 0 ? value : DEFAULT_TIME_RANGE[0]}
      </Typography>
    </Pressable>
  );
}

function TimeWheel({
  value,
  onSelectPart,
  onSelectPreset,
}: {
  value: string;
  onSelectPart: (part: 'hour' | 'minute', nextValue: string) => void;
  onSelectPreset: (timeValue: string) => void;
}) {
  const [selectedHour, selectedMinute] = (value || DEFAULT_TIME_RANGE[0]).split(':');

  return (
    <View style={styles.timeWheel}>
      <ScrollView
        style={styles.wheelColumn}
        contentContainerStyle={styles.wheelContent}
        showsVerticalScrollIndicator={false}
      >
        {TIME_HOURS.map((hour) => (
          <WheelOption
            key={hour}
            label={hour}
            selected={hour === selectedHour}
            onPress={() => onSelectPart('hour', hour)}
          />
        ))}
      </ScrollView>
      <Typography
        variant="bodyM"
        color={colors.gray[500]}
        align="center"
        style={styles.timeSeparator}
      >
        :
      </Typography>
      <ScrollView
        style={styles.wheelColumn}
        contentContainerStyle={styles.wheelContent}
        showsVerticalScrollIndicator={false}
      >
        {TIME_MINUTES.map((minute) => (
          <WheelOption
            key={minute}
            label={minute}
            selected={minute === selectedMinute}
            onPress={() => onSelectPart('minute', minute)}
          />
        ))}
      </ScrollView>
      <View style={styles.quickTimes}>
        {['00:00', '09:00', '12:00', '15:00'].map((time) => (
          <Pressable
            key={time}
            accessibilityLabel={`${time} 빠른 선택`}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.quickTime,
              time === value && styles.quickTimeSelected,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelectPreset(time)}
          >
            <Typography
              variant="caption"
              color={time === value ? colors.primary : colors.gray[600]}
              align="center"
            >
              {time}
            </Typography>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function WheelOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 선택`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.wheelOption,
        selected && styles.wheelOptionSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Typography
        variant="bodyS"
        color={selected ? colors.primary : colors.gray[500]}
        align="center"
      >
        {label}
      </Typography>
    </Pressable>
  );
}

function isInvalidSameDayTimeRange(draft: DateTimeDraft) {
  if (draft.timeStart.length === 0 || draft.timeEnd.length === 0 || draft.dateMode === 'range') {
    return false;
  }

  return draft.timeStart > draft.timeEnd;
}

const styles = StyleSheet.create({
  dateTimeSheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[16] - spacing[1],
  },
  sheetHeader: {
    width: '100%',
    maxWidth: 369,
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
  },
  sheetHeaderAction: {
    zIndex: 2,
    minWidth: 33,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  dateTimeSheetContent: {
    width: '100%',
    gap: spacing[3],
  },
  calendarPanel: {
    width: '100%',
    gap: spacing[3],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[3],
    borderWidth: 0,
    backgroundColor: colors.alpha.white50,
  },
  calendarHeader: {
    minHeight: spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
  },
  monthButton: {
    minWidth: spacing[8],
    minHeight: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekCell: {
    width: '14.285%',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  dateCell: {
    width: '14.285%',
    height: DATE_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  dateCellInRange: {
    backgroundColor: colors.alpha.primary20,
  },
  dateCellSelected: {
    backgroundColor: colors.primary,
  },
  timePanel: {
    width: '100%',
    gap: spacing[2],
    padding: spacing[4],
    borderWidth: 0,
    backgroundColor: colors.alpha.white50,
  },
  timeDraftRow: {
    minHeight: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
    borderRadius: radius.sm,
  },
  timeDraftRowSelected: {
    backgroundColor: colors.alpha.white70,
  },
  errorBox: {
    minHeight: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.gray[600],
  },
  errorText: {
    flex: 1,
  },
  errorConfirm: {
    minWidth: spacing[10],
    minHeight: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
  },
  timeWheel: {
    minHeight: 136,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  wheelColumn: {
    width: 64,
    maxHeight: 132,
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
  },
  wheelContent: {
    paddingVertical: spacing[2],
  },
  wheelOption: {
    minHeight: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelOptionSelected: {
    backgroundColor: colors.alpha.primary20,
  },
  timeSeparator: {
    width: spacing[2],
  },
  quickTimes: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  quickTime: {
    minWidth: 54,
    minHeight: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
  },
  quickTimeSelected: {
    backgroundColor: colors.alpha.primary20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[50],
  },
  pressed: {
    opacity: 0.72,
  },
});
