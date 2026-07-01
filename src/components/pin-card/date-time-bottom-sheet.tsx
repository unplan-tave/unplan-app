import { useCallback, useEffect, useRef, useState } from 'react';
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
const SHEET_HEADER_MAX_WIDTH = 369;
const DATE_CELL_RADIUS = DATE_CELL_SIZE / 2;
const TIME_HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const TIME_MINUTES = [
  '00',
  '05',
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
  const [isWheelVisible, setIsWheelVisible] = useState(false);
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
      setIsWheelVisible(false);
      setCalendarBaseDate(getInitialCalendarBaseDate(value.dateStart));
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

  const handleSelectTimePart = useCallback(
    (part: 'hour' | 'minute', nextValue: string) => {
      setDraft((prev) => {
        const fieldKey = activeTimeField === 'start' ? 'timeStart' : 'timeEnd';
        const fallback = fieldKey === 'timeEnd' ? prev.timeStart : DEFAULT_TIME_RANGE[0];
        const currentTime = prev[fieldKey] || fallback || DEFAULT_TIME_RANGE[0];
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
            {calendar.cells.map((cell, index) => (
              <DateGridCell
                key={cell.key}
                cell={cell}
                column={index % 7}
                draft={draft}
                previousValue={calendar.cells[index - 1]?.value}
                nextValue={calendar.cells[index + 1]?.value}
                onSelect={handleSelectDate}
              />
            ))}
          </View>
        </Card>

        <Card variant="solid" accessibilityRole="none" style={styles.timePanel}>
          <TimeDraftRow
            label="시작 시간"
            value={draft.timeStart}
            selected={isWheelVisible && activeTimeField === 'start'}
            filled={draft.timeStart.length > 0}
            error={showTimeOrderError}
            onPress={() => {
              setActiveTimeField('start');
              setIsWheelVisible(true);
              setShowTimeOrderError(false);
            }}
          />
          <View style={styles.divider} />
          <TimeDraftRow
            label="종료 시간"
            value={draft.timeEnd}
            selected={isWheelVisible && activeTimeField === 'end'}
            filled={draft.timeEnd.length > 0}
            error={showTimeOrderError}
            onPress={() => {
              if (draft.timeEnd.length === 0 && draft.timeStart.length > 0) {
                setDraft((prev) => ({ ...prev, timeEnd: prev.timeStart }));
              }
              setActiveTimeField('end');
              setIsWheelVisible(true);
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
          {isWheelVisible ? (
            <DrumTimePicker
              value={activeTimeField === 'start' ? draft.timeStart : draft.timeEnd}
              onSelectPart={handleSelectTimePart}
            />
          ) : null}
        </Card>
      </View>
    </BottomSheet>
  );
}

function DateGridCell({
  cell,
  column,
  draft,
  previousValue,
  nextValue,
  onSelect,
}: {
  cell: { label: string; value: string };
  column: number;
  draft: DateTimeDraft;
  previousValue?: string;
  nextValue?: string;
  onSelect: (value: string) => void;
}) {
  const isRange = draft.dateMode === 'range' && draft.dateEnd.length > 0;
  const isRangeStart = isRange && cell.value === draft.dateStart;
  const isRangeEnd = isRange && cell.value === draft.dateEnd;
  const isSingle = draft.dateMode === 'single' && cell.value === draft.dateStart;
  const isRangeMiddle = isRange && isDateInDraftRange(cell.value, draft);
  const isEndpoint = isRangeStart || isRangeEnd || isSingle;
  const inRangeBand = isRangeStart || isRangeEnd || isRangeMiddle;

  const hasPreviousInRow = column > 0 && isDateVisibleRangeCell(previousValue, draft);
  const hasNextInRow = column < 6 && isDateVisibleRangeCell(nextValue, draft);
  const continuesFromPreviousWeek =
    column === 0 &&
    cell.value.length > 0 &&
    cell.value > draft.dateStart &&
    cell.value <= draft.dateEnd;
  const continuesToNextWeek =
    column === 6 &&
    cell.value.length > 0 &&
    cell.value < draft.dateEnd &&
    cell.value >= draft.dateStart;

  const showTrackLeft =
    inRangeBand && (isRangeMiddle || isRangeEnd) && (hasPreviousInRow || continuesFromPreviousWeek);
  const showTrackRight =
    inRangeBand && (isRangeMiddle || isRangeStart) && (hasNextInRow || continuesToNextWeek);

  return (
    <Pressable
      accessibilityLabel={cell.value ? `${cell.value} 선택` : '빈 날짜'}
      accessibilityRole="button"
      accessibilityState={{ selected: isEndpoint }}
      disabled={cell.value.length === 0}
      style={({ pressed }) => [styles.dateCell, pressed && styles.pressed]}
      onPress={() => onSelect(cell.value)}
    >
      {showTrackLeft || showTrackRight ? (
        <View
          style={[
            styles.dateRangeTrack,
            showTrackLeft && showTrackRight
              ? styles.dateRangeTrackFull
              : showTrackLeft
                ? styles.dateRangeTrackLeft
                : styles.dateRangeTrackRight,
          ]}
        />
      ) : null}
      {isEndpoint ? (
        <View style={[styles.dateCircle, styles.dateCircleSelected]}>
          <Typography variant="bodyM" color={colors.gray.white} align="center">
            {cell.label}
          </Typography>
        </View>
      ) : (
        <View style={styles.dateCircle}>
          <Typography variant="bodyM" color={colors.gray[700]} align="center">
            {cell.label}
          </Typography>
        </View>
      )}
    </Pressable>
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
        color={
          error
            ? colors.secondary
            : filled && selected
              ? colors.primary
              : filled
                ? colors.gray[600]
                : colors.gray[300]
        }
      >
        {filled ? value : '--:--'}
      </Typography>
    </Pressable>
  );
}

function DrumTimePicker({
  value,
  onSelectPart,
}: {
  value: string;
  onSelectPart: (part: 'hour' | 'minute', nextValue: string) => void;
}) {
  const [selectedHour, selectedMinute] = (value || DEFAULT_TIME_RANGE[0]).split(':');
  const hourIndex = TIME_HOURS.indexOf(selectedHour) >= 0 ? TIME_HOURS.indexOf(selectedHour) : 0;
  const minuteItems = TIME_MINUTES as unknown as string[];
  const minuteIndex =
    minuteItems.indexOf(selectedMinute) >= 0 ? minuteItems.indexOf(selectedMinute) : 0;

  return (
    <View style={styles.drumPicker}>
      <View style={styles.drumHighlight} pointerEvents="none" />
      <DrumColumn
        items={TIME_HOURS}
        selectedIndex={hourIndex}
        onSelect={(val) => onSelectPart('hour', val)}
      />
      <Typography variant="bodyM" color={colors.gray[900]} align="center">
        :
      </Typography>
      <DrumColumn
        items={minuteItems}
        selectedIndex={minuteIndex}
        onSelect={(val) => onSelectPart('minute', val)}
      />
    </View>
  );
}

function DrumColumn({
  items,
  selectedIndex,
  onSelect,
}: {
  items: string[];
  selectedIndex: number;
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
            accessibilityLabel={isActual ? `${item} 선택` : undefined}
            accessibilityRole={isActual ? 'button' : undefined}
            accessibilityState={isActual ? { selected: dist === 0 } : undefined}
          >
            <Typography variant="bodyM" color={colors.gray[900]} align="center" style={{ opacity }}>
              {item}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function isInvalidSameDayTimeRange(draft: DateTimeDraft) {
  if (draft.timeStart.length === 0 || draft.timeEnd.length === 0 || draft.dateMode === 'range') {
    return false;
  }

  return draft.timeStart > draft.timeEnd;
}

function isDateVisibleRangeCell(value: string | undefined, draft: DateTimeDraft) {
  if (value == null || value.length === 0 || draft.dateMode !== 'range') {
    return false;
  }

  return value >= draft.dateStart && value <= draft.dateEnd;
}

function getInitialCalendarBaseDate(dateValue: string) {
  const [year, month] = dateValue.split('.').map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || year < 1900 || month < 1 || month > 12) {
    return new Date();
  }

  return new Date(year, month - 1, 1);
}

const styles = StyleSheet.create({
  dateTimeSheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[15],
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
    overflow: 'visible',
  },
  dateRangeTrack: {
    position: 'absolute',
    top: 0,
    height: DATE_CELL_SIZE,
    backgroundColor: colors.alpha.primary20,
  },
  dateRangeTrackFull: {
    left: 0,
    right: 0,
  },
  dateRangeTrackLeft: {
    left: 0,
    right: '50%',
  },
  dateRangeTrackRight: {
    left: '50%',
    right: 0,
  },
  dateCircle: {
    zIndex: 1,
    width: DATE_CELL_SIZE,
    height: DATE_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DATE_CELL_RADIUS,
  },
  dateCircleSelected: {
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
  drumPicker: {
    width: '100%',
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  drumHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: DRUM_ITEM_HEIGHT * DRUM_PADDING,
    height: DRUM_ITEM_HEIGHT,
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  drumColumn: {
    width: 40,
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
  },
  drumItem: {
    height: DRUM_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
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
