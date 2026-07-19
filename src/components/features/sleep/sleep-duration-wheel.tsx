import { useEffect, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { SLEEP_HOUR_OPTIONS, SLEEP_MINUTE_OPTIONS, splitDuration } from '@/domains/sleep/measure';

interface SleepDurationWheelProps {
  durationMinutes: number;
  onChange: (durationMinutes: number) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PADDING_ROWS = (VISIBLE_ROWS - 1) / 2;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;

/** 취침 길이를 HH시간 MM분으로 고르는 휠 피커입니다. */
export function SleepDurationWheel({ durationMinutes, onChange }: SleepDurationWheelProps) {
  const { hours, minutes } = splitDuration(durationMinutes);

  return (
    <View style={styles.wheel}>
      <View pointerEvents="none" style={styles.centerBand} />
      <View style={styles.row}>
        <WheelColumn
          accessibilityLabel="수면 시간"
          options={SLEEP_HOUR_OPTIONS}
          value={hours}
          onChange={(next) => onChange(next * 60 + minutes)}
        />
        <Typography variant="titleM" color={colors.gray[500]} style={styles.unit}>
          시간
        </Typography>
        <WheelColumn
          accessibilityLabel="수면 분"
          options={SLEEP_MINUTE_OPTIONS}
          value={minutes}
          onChange={(next) => onChange(hours * 60 + next)}
        />
        <Typography variant="titleM" color={colors.gray[500]} style={styles.unit}>
          분
        </Typography>
      </View>
    </View>
  );
}

function WheelColumn({
  accessibilityLabel,
  options,
  value,
  onChange,
}: {
  accessibilityLabel: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const settledIndex = useRef(-1);
  const index = Math.max(0, options.indexOf(value));

  useEffect(() => {
    if (settledIndex.current === index) return;

    settledIndex.current = index;
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
  }, [index]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.min(options.length - 1, Math.max(0, nextIndex));

    settledIndex.current = clamped;
    if (options[clamped] !== value) onChange(options[clamped]);
  };

  return (
    <ScrollView
      ref={scrollRef}
      accessibilityLabel={accessibilityLabel}
      style={styles.column}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      contentContainerStyle={styles.columnContent}
      onMomentumScrollEnd={handleMomentumEnd}
    >
      {options.map((option) => (
        <Pressable
          key={option}
          style={styles.item}
          onPress={() => {
            settledIndex.current = -1;
            onChange(option);
          }}
        >
          <Typography
            variant="titleL"
            align="center"
            color={option === value ? colors.primary : colors.gray[400]}
          >
            {option.toString().padStart(2, '0')}
          </Typography>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wheel: {
    height: WHEEL_HEIGHT,
    justifyContent: 'center',
  },
  centerBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PADDING_ROWS * ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white70,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  column: {
    width: 56,
    height: WHEEL_HEIGHT,
  },
  columnContent: {
    paddingVertical: PADDING_ROWS * ITEM_HEIGHT,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unit: {
    width: 44,
  },
});
