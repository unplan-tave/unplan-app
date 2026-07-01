import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WEEKDAY_LABELS } from '@/state/pin-card/data';
import { getCalendarMonth, type CalendarCell } from '@/state/pin-card/model';
import {
  addDurationMinutes,
  compareDueDateValues,
  createDefaultDurationDraft,
  DURATION_INCREMENT_BUTTONS,
  formatDueDateForStorage,
  formatDurationInline,
  type DueDurationDraft,
  UNKNOWN_DURATION_LABEL,
} from '@/state/pin-card/queue';

const DATE_CELL_SIZE = spacing[8];
const SHEET_HEADER_MAX_WIDTH = 369;
const DATE_CELL_RADIUS = DATE_CELL_SIZE / 2;
const TODAY_DOT_SIZE = 4;
const DURATION_BUTTON_HEIGHT = spacing[10];

export function DueDurationBottomSheet({
  visible,
  value,
  onClose,
  onDone,
  onDurationUnknown,
}: {
  visible: boolean;
  value: DueDurationDraft;
  onClose: () => void;
  onDone: (draft: DueDurationDraft) => void;
  onDurationUnknown?: () => void;
}) {
  const [draft, setDraft] = useState<DueDurationDraft>(value);
  const [calendarBaseDate, setCalendarBaseDate] = useState(() => new Date());
  const calendar = getCalendarMonth(calendarBaseDate);
  const todayValue = formatDueDateForStorage(new Date());

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraft({
      dueDate: value.dueDate,
      durationHours: value.durationHours,
      durationMinutes: value.durationMinutes,
      durationUnknown: value.durationUnknown,
    });
    setCalendarBaseDate(getInitialCalendarBaseDate(value.dueDate));
  }, [value.dueDate, value.durationHours, value.durationMinutes, value.durationUnknown, visible]);

  const handleSelectDate = useCallback((dateValue: string) => {
    if (dateValue.length === 0) {
      return;
    }

    setDraft((prev) => ({ ...prev, dueDate: dateValue }));
  }, []);

  const handleAddDuration = useCallback((minutes: number) => {
    setDraft((prev) => {
      const base = prev.durationUnknown
        ? createDefaultDurationDraft()
        : {
            durationHours: prev.durationHours,
            durationMinutes: prev.durationMinutes,
            durationUnknown: false,
          };
      const nextDuration = addDurationMinutes(base.durationHours, base.durationMinutes, minutes);

      return {
        ...prev,
        ...nextDuration,
        durationUnknown: false,
      };
    });
  }, []);

  const handleResetDuration = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      ...createDefaultDurationDraft(),
    }));
  }, []);

  const handleDurationUnknown = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      ...createDefaultDurationDraft(),
      durationUnknown: true,
    }));
    onDurationUnknown?.();
  }, [onDurationUnknown]);

  const handleMoveMonth = useCallback((offset: number) => {
    setCalendarBaseDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }, []);

  const handleDone = useCallback(() => {
    onDone(draft);
  }, [draft, onDone]);

  const durationSummary = draft.durationUnknown
    ? UNKNOWN_DURATION_LABEL
    : formatDurationInline(draft.durationHours, draft.durationMinutes);
  const durationSummaryColor = draft.durationUnknown
    ? colors.gray[600]
    : draft.durationHours === 0 && draft.durationMinutes === 0
      ? colors.gray[400]
      : colors.gray[800];

  return (
    <BottomSheet visible={visible} avoidKeyboard contentStyle={styles.sheet} onClose={onClose}>
      <View style={styles.sheetHeader}>
        <Pressable
          accessibilityLabel="마감일과 소요시간 선택 취소"
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
          마감일/소요시간
        </Typography>
        <Pressable
          accessibilityLabel="마감일과 소요시간 선택 완료"
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

      <View style={styles.sheetContent}>
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
            <Typography variant="titleS" color={colors.gray[900]} align="center">
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
            {calendar.cells.map((cell) => (
              <DueDateCell
                key={cell.key}
                cell={cell}
                isPast={cell.value.length > 0 && compareDueDateValues(cell.value, todayValue) < 0}
                isSelected={cell.value.length > 0 && cell.value === draft.dueDate}
                isToday={cell.value.length > 0 && cell.value === todayValue}
                onSelect={handleSelectDate}
              />
            ))}
          </View>
        </Card>

        <Card variant="solid" accessibilityRole="none" style={styles.durationPanel}>
          <View style={styles.durationSummaryRow}>
            <Typography variant="bodyM" color={colors.gray[600]}>
              소요 시간
            </Typography>
            <View style={styles.durationSummaryValue}>
              {!draft.durationUnknown ? (
                <Typography variant="bodyM" color={colors.gray[500]}>
                  약
                </Typography>
              ) : null}
              <View style={styles.durationSummaryField}>
                <Typography variant="bodyM" color={durationSummaryColor} numberOfLines={1}>
                  {durationSummary}
                </Typography>
              </View>
              <Pressable
                accessibilityLabel="소요시간 초기화"
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
                onPress={handleResetDuration}
              >
                <Icon name="refresh" size={24} color={colors.gray[600]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.durationButtonGrid}>
            {DURATION_INCREMENT_BUTTONS.map((button) => (
              <Pressable
                key={button.label}
                accessibilityLabel={`${button.label} 추가`}
                accessibilityRole="button"
                style={({ pressed }) => [styles.durationButton, pressed && styles.pressed]}
                onPress={() => handleAddDuration(button.minutes)}
              >
                <Typography variant="bodyM" color={colors.gray[800]} align="center">
                  {button.label}
                </Typography>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityLabel="소요시간 모르겠어요"
            accessibilityRole="button"
            style={({ pressed }) => [styles.unknownButton, pressed && styles.pressed]}
            onPress={handleDurationUnknown}
          >
            <Typography variant="bodyS" color={colors.gray[500]}>
              모르겠어요
            </Typography>
          </Pressable>
        </Card>
      </View>
    </BottomSheet>
  );
}

function DueDateCell({
  cell,
  isPast,
  isSelected,
  isToday,
  onSelect,
}: {
  cell: CalendarCell;
  isPast: boolean;
  isSelected: boolean;
  isToday: boolean;
  onSelect: (value: string) => void;
}) {
  const isDisabled = cell.value.length === 0 || isPast;
  const textColor = isSelected ? colors.gray.white : isPast ? colors.gray[400] : colors.gray[700];

  return (
    <Pressable
      accessibilityLabel={cell.value ? `${cell.value} 선택` : '빈 날짜'}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.dateCell,
        pressed && !isDisabled && styles.pressed,
        isPast && styles.pastDateCell,
      ]}
      onPress={() => onSelect(cell.value)}
    >
      {isSelected ? (
        <View style={[styles.dateCircle, styles.dateCircleSelected]}>
          <Typography variant="bodyM" color={textColor} align="center">
            {cell.label}
          </Typography>
        </View>
      ) : (
        <View style={styles.dateCircle}>
          <Typography variant="bodyM" color={textColor} align="center">
            {cell.label}
          </Typography>
          {isToday ? <View style={styles.todayDot} /> : null}
        </View>
      )}
    </Pressable>
  );
}

function getInitialCalendarBaseDate(dateValue: string) {
  const [year, month] = dateValue.replace(/-/g, '.').split('.').map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || year < 1900 || month < 1 || month > 12) {
    return new Date();
  }

  return new Date(year, month - 1, 1);
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[16] - spacing[1],
  },
  sheetHeader: {
    width: '100%',
    maxWidth: SHEET_HEADER_MAX_WIDTH,
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
  sheetContent: {
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
    overflow: 'visible',
  },
  pastDateCell: {
    opacity: 0.5,
  },
  dateCircle: {
    width: DATE_CELL_SIZE,
    height: DATE_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DATE_CELL_RADIUS,
  },
  dateCircleSelected: {
    backgroundColor: colors.primary,
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: TODAY_DOT_SIZE,
    height: TODAY_DOT_SIZE,
    borderRadius: TODAY_DOT_SIZE / 2,
    backgroundColor: colors.gray.white,
  },
  durationPanel: {
    width: '100%',
    gap: spacing[3],
    padding: spacing[3],
    borderWidth: 0,
    backgroundColor: colors.alpha.white50,
  },
  durationSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  durationSummaryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[1],
  },
  durationSummaryField: {
    minHeight: spacing[8],
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
    borderRadius: radius.xs,
    backgroundColor: colors.alpha.white50,
  },
  resetButton: {
    width: spacing[8],
    height: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xs,
    backgroundColor: colors.alpha.white50,
  },
  durationButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  durationButton: {
    width: '31.5%',
    minHeight: DURATION_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
  unknownButton: {
    alignSelf: 'center',
    minHeight: spacing[6],
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  pressed: {
    opacity: 0.72,
  },
});
