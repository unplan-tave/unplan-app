import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import type { MinuteRange } from '@/domains/ai-recommendation/model';

const DRUM_ITEM_HEIGHT = 36;
const DRUM_PADDING = 2;
const HOUR_ITEMS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const MINUTE_ITEMS = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'));

interface TimeRangePickerSheetProps {
  visible: boolean;
  initialRange: MinuteRange;
  /** 검증 실패 메시지 — 시트가 모달이라 화면 토스트가 가려지므로 시트 안에서 표시합니다. */
  toastMessage?: string | null;
  onToastClose?: () => void;
  onSubmit: (range: MinuteRange) => void;
  onClose: () => void;
}

export function TimeRangePickerSheet({
  visible,
  initialRange,
  toastMessage,
  onToastClose,
  onSubmit,
  onClose,
}: TimeRangePickerSheetProps) {
  const [startMinutes, setStartMinutes] = useState(initialRange.startMinutes);
  const [endMinutes, setEndMinutes] = useState(initialRange.endMinutes);

  useEffect(() => {
    if (visible) {
      setStartMinutes(initialRange.startMinutes);
      setEndMinutes(initialRange.endMinutes);
    }
  }, [initialRange.endMinutes, initialRange.startMinutes, visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            {t('common.cancel')}
          </Typography>
        </Pressable>
        <Typography variant="bodyM" color={colors.gray[700]}>
          {t('settings.recommendation.excludeTime')}
        </Typography>
        <Pressable
          accessibilityLabel={t('common.done')}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={() => onSubmit({ startMinutes, endMinutes })}
        >
          <Typography variant="bodyM" color={colors.primary}>
            {t('common.done')}
          </Typography>
        </Pressable>
      </View>
      {toastMessage ? (
        <View style={styles.toastSlot}>
          <CardToast message={toastMessage} bottomOffset={0} onClose={onToastClose ?? (() => {})} />
        </View>
      ) : null}
      <TimeOfDayPicker
        label={t('settings.recommendation.startTime')}
        minutes={startMinutes}
        onChange={setStartMinutes}
      />
      <TimeOfDayPicker
        label={t('settings.recommendation.endTime')}
        minutes={endMinutes}
        onChange={setEndMinutes}
      />
    </BottomSheet>
  );
}

function TimeOfDayPicker({
  label,
  minutes,
  onChange,
}: {
  label: string;
  minutes: number;
  onChange: (minutes: number) => void;
}) {
  const hourIndex = Math.floor(minutes / 60) % 24;
  const minuteIndex = minutes % 60;

  return (
    <View style={styles.pickerSection}>
      <Typography variant="bodyM" align="center" color={colors.gray[400]}>
        {label}
      </Typography>
      <View style={styles.drumPicker}>
        <View style={styles.drumHighlight} pointerEvents="none" />
        <DrumColumn
          items={HOUR_ITEMS}
          selectedIndex={hourIndex}
          onSelect={(index) => onChange(index * 60 + minuteIndex)}
        />
        <Typography variant="bodyM" color={colors.gray[600]}>
          시
        </Typography>
        <DrumColumn
          items={MINUTE_ITEMS}
          selectedIndex={minuteIndex}
          onSelect={(index) => onChange(hourIndex * 60 + index)}
        />
        <Typography variant="bodyM" color={colors.gray[600]}>
          분
        </Typography>
      </View>
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
  onSelect: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * DRUM_ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const handleMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / DRUM_ITEM_HEIGHT);

      onSelect(Math.max(0, Math.min(items.length - 1, index)));
    },
    [items.length, onSelect],
  );

  const handleItemPress = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({ y: index * DRUM_ITEM_HEIGHT, animated: true });
      onSelect(index);
    },
    [onSelect],
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
      {paddedItems.map((item, paddedIndex) => {
        const actualIndex = paddedIndex - DRUM_PADDING;
        const isActual = actualIndex >= 0 && actualIndex < items.length;
        const distance = Math.abs(actualIndex - selectedIndex);
        const opacity = !isActual ? 0 : distance === 0 ? 1 : distance === 1 ? 0.45 : 0.18;

        return (
          <Pressable
            key={paddedIndex}
            style={styles.drumItem}
            disabled={!isActual}
            accessibilityLabel={isActual ? `${item} 선택` : undefined}
            accessibilityRole={isActual ? 'button' : undefined}
            accessibilityState={isActual ? { selected: distance === 0 } : undefined}
            onPress={isActual ? () => handleItemPress(actualIndex) : undefined}
          >
            <Typography
              variant="titleS"
              align="center"
              color={distance === 0 ? colors.primary : colors.gray[600]}
              style={{ opacity }}
            >
              {item}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    minWidth: 44,
    minHeight: 32,
    justifyContent: 'center',
  },
  toastSlot: {
    minHeight: 48,
    justifyContent: 'flex-end',
  },
  pickerSection: {
    gap: spacing[2],
  },
  drumPicker: {
    width: '100%',
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
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
    width: 64,
    height: DRUM_ITEM_HEIGHT * (DRUM_PADDING * 2 + 1),
    flexGrow: 0,
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
