import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

export interface SleepWeekDay {
  /** 'YYYY-MM-DD' */
  id: string;
  day: string;
  weekday: string;
  inRange: boolean;
  isStart: boolean;
  isEnd: boolean;
  disabled: boolean;
}

interface SleepWeekPickerProps {
  monthLabel: string;
  days: SleepWeekDay[];
  onSelect: (id: string) => void;
  onShiftDateRange: (direction: 'previous' | 'next') => void;
}

/** 수면 측정 카드의 주간 날짜 범위 선택기입니다. (취침일~기상일) */
export function SleepWeekPicker({
  monthLabel,
  days,
  onSelect,
  onShiftDateRange,
}: SleepWeekPickerProps) {
  const translateX = useSharedValue(0);
  const hasMovedDate = useSharedValue(false);
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onBegin(() => {
      hasMovedDate.value = false;
    })
    .onUpdate((event) => {
      translateX.value = Math.max(
        -MAX_SWIPE_DISTANCE,
        Math.min(MAX_SWIPE_DISTANCE, event.translationX),
      );

      if (hasMovedDate.value || Math.abs(event.translationX) < DATE_CHANGE_THRESHOLD) return;

      hasMovedDate.value = true;
      runOnJS(onShiftDateRange)(event.translationX < 0 ? 'previous' : 'next');
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 260 });
    });

  return (
    <View style={styles.container}>
      <Typography variant="bodyM" align="center" color={colors.gray[700]}>
        {monthLabel}
      </Typography>
      <View style={styles.railViewport}>
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={slideStyle}>
            <View style={styles.weekRow}>
              {days.map((item) => (
                <Typography
                  key={`head-${item.id}`}
                  variant="caption"
                  align="center"
                  color={colors.gray[400]}
                  style={styles.cell}
                >
                  {item.weekday}
                </Typography>
              ))}
            </View>
            <View style={styles.weekRow}>
              {days.map((item) => {
                const edge = item.isStart || item.isEnd;

                return (
                  <View key={item.id} style={styles.cell}>
                    {item.inRange && !edge ? <View style={styles.rangeBand} /> : null}
                    {item.isStart && !item.isEnd ? (
                      <View style={[styles.rangeBand, styles.rangeRight]} />
                    ) : null}
                    {item.isEnd && !item.isStart ? (
                      <View style={[styles.rangeBand, styles.rangeLeft]} />
                    ) : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: edge, disabled: item.disabled }}
                      disabled={item.disabled}
                      style={({ pressed }) => [
                        styles.dayButton,
                        edge && styles.dayButtonSelected,
                        pressed && !item.disabled && !edge && styles.pressed,
                      ]}
                      onPress={() => onSelect(item.id)}
                    >
                      <Typography
                        variant="bodyM"
                        align="center"
                        color={
                          edge
                            ? colors.gray.white
                            : item.disabled
                              ? colors.gray[300]
                              : colors.gray[800]
                        }
                      >
                        {item.day}
                      </Typography>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const DAY_SIZE = 36;
const MAX_SWIPE_DISTANCE = 80;
const DATE_CHANGE_THRESHOLD = 24;

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  railViewport: {
    overflow: 'hidden',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    marginVertical: (DAY_SIZE - 32) / 2,
    backgroundColor: colors.alpha.primary20,
  },
  rangeLeft: {
    right: '50%',
    borderTopLeftRadius: radius.full,
    borderBottomLeftRadius: radius.full,
  },
  rangeRight: {
    left: '50%',
    borderTopRightRadius: radius.full,
    borderBottomRightRadius: radius.full,
  },
  dayButton: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
