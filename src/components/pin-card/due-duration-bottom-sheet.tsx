import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WEEKDAY_LABELS } from '@/state/pin-card/data';
import { getCalendarMonth, type CalendarCell } from '@/state/pin-card/model';
import {
  compareDueDateValues,
  formatDueDateForStorage,
  type DueDurationDraft,
} from '@/state/pin-card/queue';

const DATE_CELL_SIZE = spacing[8];
const SHEET_HEADER_MAX_WIDTH = 369;
const DATE_CELL_RADIUS = DATE_CELL_SIZE / 2;
const DURATION_HOURS = Array.from({ length: 25 }, (_, index) => String(index));
const DURATION_MINUTES = [
  '0',
  '5',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
] as const;
const DRUM_ITEM_HEIGHT = 32;
const DRUM_PADDING = 2;
const TODAY_DOT_SIZE = 4;

export function DueDurationBottomSheet({
  visible,
  value,
  onClose,
  onDone,
}: {
  visible: boolean;
  value: DueDurationDraft;
  onClose: () => void;
  onDone: (draft: DueDurationDraft) => void;
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
    });
    setCalendarBaseDate(getInitialCalendarBaseDate(value.dueDate));
  }, [value.dueDate, value.durationHours, value.durationMinutes, visible]);

  const handleSelectDate = useCallback((dateValue: string) => {
    if (dateValue.length === 0) {
      return;
    }

    setDraft((prev) => ({ ...prev, dueDate: dateValue }));
  }, []);

  const handleSelectDurationPart = useCallback((part: 'hour' | 'minute', nextValue: string) => {
    setDraft((prev) => ({
      ...prev,
      durationHours: part === 'hour' ? Number(nextValue) : prev.durationHours,
      durationMinutes: part === 'minute' ? Number(nextValue) : prev.durationMinutes,
    }));
  }, []);

  const handleMoveMonth = useCallback((offset: number) => {
    setCalendarBaseDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }, []);

  const handleDone = useCallback(() => {
    onDone(draft);
  }, [draft, onDone]);

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
          <View style={styles.durationHeader}>
            <Typography variant="bodyM" color={colors.gray[800]}>
              약
            </Typography>
          </View>
          <DrumDurationPicker
            hours={draft.durationHours}
            minutes={draft.durationMinutes}
            onSelectPart={handleSelectDurationPart}
          />
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
  const textColor = isSelected ? colors.gray.white : isPast ? colors.gray[400] : colors.gray[700];

  return (
    <Pressable
      accessibilityLabel={cell.value ? `${cell.value} 선택` : '빈 날짜'}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      disabled={cell.value.length === 0}
      style={({ pressed }) => [styles.dateCell, pressed && styles.pressed]}
      onPress={() => onSelect(cell.value)}
    >
      {isSelected ? (
        <View style={[styles.dateCircle, styles.dateCircleSelected]}>
          <Typography
            variant="bodyM"
            color={textColor}
            align="center"
            style={isPast && styles.pastDate}
          >
            {cell.label}
          </Typography>
        </View>
      ) : (
        <View style={styles.dateCircle}>
          <Typography
            variant="bodyM"
            color={textColor}
            align="center"
            style={isPast && styles.pastDate}
          >
            {cell.label}
          </Typography>
          {isToday ? <View style={styles.todayDot} /> : null}
        </View>
      )}
    </Pressable>
  );
}

function DrumDurationPicker({
  hours,
  minutes,
  onSelectPart,
}: {
  hours: number;
  minutes: number;
  onSelectPart: (part: 'hour' | 'minute', nextValue: string) => void;
}) {
  const hourValue = String(hours);
  const minuteValue = String(minutes);
  const hourIndex = DURATION_HOURS.indexOf(hourValue) >= 0 ? DURATION_HOURS.indexOf(hourValue) : 0;
  const minuteItems = DURATION_MINUTES as unknown as string[];
  const minuteIndex = minuteItems.indexOf(minuteValue) >= 0 ? minuteItems.indexOf(minuteValue) : 0;

  return (
    <View style={styles.drumPicker}>
      <View style={styles.drumHighlight} pointerEvents="none" />
      <DrumColumn
        items={DURATION_HOURS}
        selectedIndex={hourIndex}
        suffix="시간"
        onSelect={(val) => onSelectPart('hour', val)}
      />
      <DrumColumn
        items={minuteItems}
        selectedIndex={minuteIndex}
        suffix="분"
        onSelect={(val) => onSelectPart('minute', val)}
      />
    </View>
  );
}

function DrumColumn({
  items,
  selectedIndex,
  suffix,
  onSelect,
}: {
  items: string[];
  selectedIndex: number;
  suffix: string;
  onSelect: (value: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * DRUM_ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const handleMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / DRUM_ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));

      if (items[clamped] !== undefined) {
        onSelect(items[clamped]);
      }
    },
    [items, onSelect],
  );

  const handleItemPress = useCallback(
    (actualIndex: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, actualIndex));
      scrollRef.current?.scrollTo({ y: clamped * DRUM_ITEM_HEIGHT, animated: true });
      onSelect(items[clamped]);
    },
    [items, onSelect],
  );

  const paddedItems = [...Array(DRUM_PADDING).fill(''), ...items, ...Array(DRUM_PADDING).fill('')];

  return (
    <View style={styles.drumColumnGroup}>
      <ScrollView
        ref={scrollRef}
        style={styles.drumColumn}
        showsVerticalScrollIndicator={false}
        snapToInterval={DRUM_ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {paddedItems.map((item, i) => {
          const actualIndex = i - DRUM_PADDING;
          const isActual = actualIndex >= 0 && actualIndex < items.length;
          const dist = Math.abs(actualIndex - selectedIndex);
          const opacity = !isActual ? 0 : dist === 0 ? 1 : dist === 1 ? 0.45 : 0.18;

          return (
            <Pressable
              key={i}
              style={styles.drumItem}
              disabled={!isActual}
              onPress={isActual ? () => handleItemPress(actualIndex) : undefined}
              accessibilityLabel={isActual ? `${item}${suffix} 선택` : undefined}
              accessibilityRole={isActual ? 'button' : undefined}
              accessibilityState={isActual ? { selected: dist === 0 } : undefined}
            >
              <Typography
                variant="bodyM"
                color={colors.gray[900]}
                align="center"
                style={{ opacity }}
              >
                {isActual ? `${item}${suffix}` : ''}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
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
  pastDate: {
    opacity: 0.5,
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
    gap: spacing[2],
    padding: spacing[4],
    borderWidth: 0,
    backgroundColor: colors.alpha.white50,
  },
  durationHeader: {
    paddingHorizontal: spacing[2],
  },
  drumPicker: {
    width: '100%',
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  drumHighlight: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    top: DRUM_ITEM_HEIGHT * DRUM_PADDING,
    height: DRUM_ITEM_HEIGHT,
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  drumColumnGroup: {
    flex: 1,
    alignItems: 'center',
  },
  drumColumn: {
    width: '100%',
    maxWidth: 120,
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
  },
  drumItem: {
    height: DRUM_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
