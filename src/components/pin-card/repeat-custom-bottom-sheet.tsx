import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { getCalendarMonth } from '@/state/pin-card/model';
import {
  combineIntervalDigits,
  isDateOnOrAfterSchedule,
  normalizeRecurrenceForCustomEdit,
  type RecurrenceValue,
  RECURRENCE_END_OPTIONS,
  RECURRENCE_FREQ_OPTIONS,
  splitIntervalDigits,
  WEEKLY_DETAIL_DAYS,
  DIGIT_ITEMS,
} from '@/state/pin-card/recurrence';

const DRUM_ITEM_HEIGHT = 32;
const DRUM_PADDING = 2;
const DRUM_VISIBLE_HEIGHT = DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1);
const WHEEL_WIDTH = 329;

type OpenMenu = 'none' | 'freq' | 'end';
type ActivePicker = 'none' | 'interval' | 'count';

interface RepeatCustomBottomSheetProps {
  visible: boolean;
  value: RecurrenceValue;
  scheduleDate: string;
  onClose: () => void;
  onDone: (value: RecurrenceValue) => void;
}

export function RepeatCustomBottomSheet({
  visible,
  value,
  scheduleDate,
  onClose,
  onDone,
}: RepeatCustomBottomSheetProps) {
  const [draft, setDraft] = useState<RecurrenceValue>(value);
  const [openMenu, setOpenMenu] = useState<OpenMenu>('none');
  const [activePicker, setActivePicker] = useState<ActivePicker>('none');
  const [calendarBaseDate, setCalendarBaseDate] = useState(() => new Date());

  useEffect(() => {
    if (!visible) {
      return;
    }

    const normalized = normalizeRecurrenceForCustomEdit(value, scheduleDate);

    setDraft({
      ...normalized,
      byDay: [...normalized.byDay],
    });
    setOpenMenu('none');
    setActivePicker('none');
    setCalendarBaseDate(getInitialCalendarBaseDate(normalized.until || scheduleDate));
  }, [scheduleDate, value, visible]);

  const calendar = getCalendarMonth(calendarBaseDate);
  const freqLabel =
    RECURRENCE_FREQ_OPTIONS.find((option) => option.freq === draft.freq)?.label ?? '일마다';
  const endLabel =
    RECURRENCE_END_OPTIONS.find((option) => option.type === draft.endType)?.label ?? '종료 안 함';
  const intervalDigits = splitIntervalDigits(draft.interval);
  const countDigits = splitIntervalDigits(draft.occurrenceCount);

  const closeMenus = useCallback(() => {
    setOpenMenu('none');
  }, []);

  const handleToggleWeekday = useCallback((day: number) => {
    setDraft((prev) => {
      const nextDays = prev.byDay.includes(day)
        ? prev.byDay.filter((item) => item !== day)
        : [...prev.byDay, day];

      return {
        ...prev,
        byDay: nextDays.length > 0 ? nextDays : [day],
      };
    });
  }, []);

  const handleSelectUntilDate = useCallback(
    (dateValue: string) => {
      if (!isDateOnOrAfterSchedule(dateValue, scheduleDate)) {
        return;
      }

      setDraft((prev) => ({ ...prev, until: dateValue }));
    },
    [scheduleDate],
  );

  const handleIntervalDigitChange = useCallback(
    (column: 'hundreds' | 'tens' | 'ones', digit: number) => {
      setDraft((prev) => {
        const current = splitIntervalDigits(prev.interval);

        return {
          ...prev,
          interval: combineIntervalDigits(
            column === 'hundreds' ? digit : current.hundreds,
            column === 'tens' ? digit : current.tens,
            column === 'ones' ? digit : current.ones,
          ),
        };
      });
    },
    [],
  );

  const handleCountDigitChange = useCallback(
    (column: 'hundreds' | 'tens' | 'ones', digit: number) => {
      setDraft((prev) => {
        const current = splitIntervalDigits(prev.occurrenceCount);

        return {
          ...prev,
          occurrenceCount: combineIntervalDigits(
            column === 'hundreds' ? digit : current.hundreds,
            column === 'tens' ? digit : current.tens,
            column === 'ones' ? digit : current.ones,
          ),
        };
      });
    },
    [],
  );

  const handleDone = useCallback(() => {
    onDone({
      ...draft,
      preset: 'custom',
      byDay: draft.freq === 'WEEKLY' ? draft.byDay : [],
    });
  }, [draft, onDone]);

  return (
    <BottomSheet visible={visible} contentStyle={styles.sheet} onClose={onClose}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="사용자 설정 반복 취소"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
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
          style={styles.headerTitle}
        >
          사용자 설정 반복
        </Typography>
        <Pressable
          accessibilityLabel="사용자 설정 반복 완료"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={handleDone}
        >
          <Typography variant="bodyM" color={colors.primary}>
            완료
          </Typography>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={closeMenus}
      >
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Typography variant="bodyM" color={colors.gray[600]} style={styles.panelLabel}>
              반복 주기
            </Typography>
            <View style={styles.panelHeaderRight}>
              <Pressable
                accessibilityLabel="반복 간격 입력"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.valueField,
                  activePicker === 'interval' && styles.valueFieldActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  setOpenMenu('none');
                  setActivePicker('interval');
                }}
              >
                <Typography variant="bodyM" color={colors.gray[900]} align="center">
                  {String(draft.interval)}
                </Typography>
              </Pressable>
              <Pressable
                accessibilityLabel="반복 주기 단위 선택"
                accessibilityRole="button"
                style={({ pressed }) => [styles.dropdown, pressed && styles.pressed]}
                onPress={() => {
                  setActivePicker('none');
                  setOpenMenu((prev) => (prev === 'freq' ? 'none' : 'freq'));
                }}
              >
                <Typography variant="bodyM" color={colors.gray[900]}>
                  {freqLabel}
                </Typography>
                <Icon name="arrowDown" size={16} color={colors.gray[600]} />
              </Pressable>
            </View>
          </View>

          {openMenu === 'freq' ? (
            <View style={styles.menuList}>
              {RECURRENCE_FREQ_OPTIONS.map((option) => (
                <Pressable
                  key={option.freq}
                  accessibilityLabel={`${option.label} 선택`}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                  onPress={() => {
                    setDraft((prev) => ({
                      ...prev,
                      freq: option.freq,
                      byDay:
                        option.freq === 'WEEKLY' && prev.byDay.length === 0
                          ? [new Date().getDay()]
                          : prev.byDay,
                    }));
                    setOpenMenu('none');
                  }}
                >
                  <Typography
                    variant="bodyM"
                    color={draft.freq === option.freq ? colors.primary : colors.gray[900]}
                  >
                    {option.label}
                  </Typography>
                </Pressable>
              ))}
            </View>
          ) : null}

          {activePicker === 'interval' ? (
            <DigitWheelPicker
              hundreds={intervalDigits.hundreds}
              tens={intervalDigits.tens}
              ones={intervalDigits.ones}
              onChange={handleIntervalDigitChange}
            />
          ) : null}

          {draft.freq === 'WEEKLY' ? (
            <View style={styles.weekdayRow}>
              {WEEKLY_DETAIL_DAYS.map((day) => {
                const selected = draft.byDay.includes(day.value);

                return (
                  <Pressable
                    key={day.label}
                    accessibilityLabel={`${day.label} 요일 선택`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.weekdayButton,
                      selected && styles.weekdayButtonSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleToggleWeekday(day.value)}
                  >
                    <Typography
                      variant="bodyM"
                      color={selected ? colors.gray.white : colors.gray[500]}
                      align="center"
                    >
                      {day.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Typography variant="bodyM" color={colors.gray[600]} style={styles.panelLabel}>
              종료 설정
            </Typography>
            <Pressable
              accessibilityLabel="종료 설정 선택"
              accessibilityRole="button"
              style={({ pressed }) => [styles.dropdown, pressed && styles.pressed]}
              onPress={() => {
                setActivePicker('none');
                setOpenMenu((prev) => (prev === 'end' ? 'none' : 'end'));
              }}
            >
              <Typography variant="bodyM" color={colors.gray[900]}>
                {endLabel}
              </Typography>
              <Icon name="arrowDown" size={16} color={colors.gray[600]} />
            </Pressable>
          </View>

          {openMenu === 'end' ? (
            <View style={styles.menuList}>
              {RECURRENCE_END_OPTIONS.map((option) => (
                <Pressable
                  key={option.type}
                  accessibilityLabel={`${option.label} 선택`}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                  onPress={() => {
                    setDraft((prev) => ({ ...prev, endType: option.type }));
                    setOpenMenu('none');
                    setActivePicker(option.type === 'count' ? 'count' : 'none');
                  }}
                >
                  <Typography
                    variant="bodyM"
                    color={draft.endType === option.type ? colors.primary : colors.gray[900]}
                    style={option.type !== draft.endType ? styles.menuItemMuted : undefined}
                  >
                    {option.label}
                  </Typography>
                </Pressable>
              ))}
            </View>
          ) : null}

          {draft.endType === 'count' ? (
            <View style={styles.endDetailRow}>
              <Typography variant="bodyM" color={colors.gray[600]}>
                세부 설정
              </Typography>
              <View style={styles.countInline}>
                <Pressable
                  accessibilityLabel="반복 횟수 입력"
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.valueField,
                    activePicker === 'count' && styles.valueFieldActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    setOpenMenu('none');
                    setActivePicker('count');
                  }}
                >
                  <Typography variant="bodyM" color={colors.gray[900]} align="center">
                    {draft.occurrenceCount}
                  </Typography>
                </Pressable>
                <Typography variant="bodyM" color={colors.gray[500]}>
                  회 반복
                </Typography>
              </View>
            </View>
          ) : null}

          {draft.endType === 'count' ? (
            <DigitWheelPicker
              hundreds={countDigits.hundreds}
              tens={countDigits.tens}
              ones={countDigits.ones}
              onChange={handleCountDigitChange}
            />
          ) : null}

          {draft.endType === 'until' ? (
            <>
              <View style={styles.endDetailRow}>
                <Typography variant="bodyM" color={colors.gray[600]}>
                  세부 설정
                </Typography>
                <View style={styles.valueField}>
                  <Typography variant="bodyM" color={colors.gray[900]} align="center">
                    {draft.until}
                  </Typography>
                </View>
              </View>
              <View style={styles.calendarPanel}>
                <View style={styles.calendarHeader}>
                  <Pressable
                    accessibilityLabel="이전 달 보기"
                    accessibilityRole="button"
                    hitSlop={8}
                    style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
                    onPress={() =>
                      setCalendarBaseDate(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                      )
                    }
                  >
                    <Icon name="arrowLeft" size={24} color={colors.gray[600]} />
                  </Pressable>
                  <Typography variant="titleS" color={colors.gray[900]} align="center">
                    {calendar.title}
                  </Typography>
                  <Pressable
                    accessibilityLabel="다음 달 보기"
                    accessibilityRole="button"
                    hitSlop={8}
                    style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
                    onPress={() =>
                      setCalendarBaseDate(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                      )
                    }
                  >
                    <Icon name="arrowRight" size={24} color={colors.gray[600]} />
                  </Pressable>
                </View>
                <View style={styles.dateGrid}>
                  {calendar.cells.map((cell) => {
                    if (cell.value.length === 0) {
                      return <View key={cell.key} style={styles.dateCell} />;
                    }

                    const selected = cell.value === draft.until;
                    const disabled = !isDateOnOrAfterSchedule(cell.value, scheduleDate);

                    return (
                      <Pressable
                        key={cell.key}
                        accessibilityLabel={`${cell.label}일 선택`}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled }}
                        disabled={disabled}
                        style={({ pressed }) => [
                          styles.dateCell,
                          selected && styles.dateCellSelected,
                          disabled && styles.dateCellDisabled,
                          pressed && !disabled && styles.pressed,
                        ]}
                        onPress={() => handleSelectUntilDate(cell.value)}
                      >
                        <Typography
                          variant="bodyS"
                          color={selected ? colors.gray.white : colors.gray[900]}
                          align="center"
                        >
                          {cell.label}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function DigitWheelPicker({
  hundreds,
  tens,
  ones,
  onChange,
}: {
  hundreds: number;
  tens: number;
  ones: number;
  onChange: (column: 'hundreds' | 'tens' | 'ones', digit: number) => void;
}) {
  return (
    <View style={styles.wheelPicker}>
      <View style={styles.wheelHighlight} pointerEvents="none" />
      <DigitDrumColumn selectedDigit={hundreds} onSelect={(digit) => onChange('hundreds', digit)} />
      <DigitDrumColumn selectedDigit={tens} onSelect={(digit) => onChange('tens', digit)} />
      <DigitDrumColumn selectedDigit={ones} onSelect={(digit) => onChange('ones', digit)} />
    </View>
  );
}

function DigitDrumColumn({
  selectedDigit,
  onSelect,
}: {
  selectedDigit: number;
  onSelect: (digit: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const items = DIGIT_ITEMS as unknown as string[];

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedDigit * DRUM_ITEM_HEIGHT, animated: false });
  }, [selectedDigit]);

  const handleMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / DRUM_ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      onSelect(clamped);
    },
    [items.length, onSelect],
  );

  const handleItemPress = useCallback(
    (actualIndex: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, actualIndex));
      scrollRef.current?.scrollTo({ y: clamped * DRUM_ITEM_HEIGHT, animated: true });
      onSelect(clamped);
    },
    [items.length, onSelect],
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
      {paddedItems.map((item, index) => {
        const actualIndex = index - DRUM_PADDING;
        const isActual = actualIndex >= 0 && actualIndex < items.length;
        const distance = Math.abs(actualIndex - selectedDigit);
        const opacity = !isActual ? 0 : distance === 0 ? 1 : distance === 1 ? 0.45 : 0.18;

        return (
          <Pressable
            key={`${item}-${index}`}
            style={styles.drumItem}
            disabled={!isActual}
            onPress={isActual ? () => handleItemPress(actualIndex) : undefined}
            accessibilityLabel={isActual ? `${item} 선택` : undefined}
            accessibilityRole={isActual ? 'button' : undefined}
            accessibilityState={isActual ? { selected: distance === 0 } : undefined}
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

function getInitialCalendarBaseDate(dateValue: string) {
  const [year, month] = dateValue.split('.').map(Number);

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
  header: {
    width: '100%',
    maxWidth: 369,
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
  },
  headerAction: {
    zIndex: 2,
    minWidth: 33,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  scroll: {
    width: '100%',
    maxHeight: 520,
  },
  content: {
    width: '100%',
    gap: spacing[4],
    paddingBottom: spacing[2],
  },
  panel: {
    width: '100%',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  panelLabel: {
    width: 59,
    flexShrink: 0,
  },
  panelHeaderRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  valueField: {
    minWidth: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2] - 1,
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  valueFieldActive: {
    backgroundColor: colors.alpha.white70,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 32,
    paddingHorizontal: spacing[2] - 1,
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  menuList: {
    alignSelf: 'stretch',
    borderRadius: radius.xs,
    backgroundColor: colors.alpha.white50,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  menuItemMuted: {
    opacity: 0.5,
  },
  wheelPicker: {
    position: 'relative',
    alignSelf: 'center',
    width: '100%',
    maxWidth: WHEEL_WIDTH,
    height: 113,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  wheelHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40,
    height: 32,
    borderRadius: radius.xs,
    backgroundColor: colors.alpha.white50,
  },
  drumColumn: {
    width: 20,
    height: DRUM_VISIBLE_HEIGHT,
  },
  drumItem: {
    height: DRUM_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[3],
  },
  weekdayButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  weekdayButtonSelected: {
    backgroundColor: colors.primary,
  },
  endDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  countInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  calendarPanel: {
    alignSelf: 'stretch',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: radius.sm,
    backgroundColor: colors.alpha.white50,
  },
  calendarHeader: {
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
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  dateCell: {
    width: '14.285%',
    height: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  dateCellSelected: {
    backgroundColor: colors.primary,
  },
  dateCellDisabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.72,
  },
});
