import { useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { RadialGradient, Rect, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';
import { getSelectedActivityHours } from '@/state/onboarding/activity-time-ranges';

import type { TimeRange } from '@/state/onboarding/model';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface ActivityTimeRailProps {
  id: string;
  label: string;
  required?: boolean;
  requiredLabel?: string;
  ranges: TimeRange[];
  onToggleHour: (hour: number) => void;
}

interface SelectedSegment {
  startIndex: number;
  length: number;
}

const HOURS_PER_DAY = 24;
const HOUR_CELL_SIZE = 40;
const CYCLE_WIDTH = HOURS_PER_DAY * HOUR_CELL_SIZE;
const REPEAT_COUNT = 3;
const INITIAL_HOUR = 21;
const INITIAL_PEEK_OFFSET = 31;
const INITIAL_SCROLL_X = CYCLE_WIDTH + INITIAL_HOUR * HOUR_CELL_SIZE - INITIAL_PEEK_OFFSET;
const LOOP_START_THRESHOLD = CYCLE_WIDTH / 2;
const LOOP_END_THRESHOLD = CYCLE_WIDTH * 2;
const REPEATED_HOURS = Array.from(
  { length: HOURS_PER_DAY * REPEAT_COUNT },
  (_, index) => index % HOURS_PER_DAY,
);

function getSelectedSegments(selectedHours: Set<number>): SelectedSegment[] {
  const segments: SelectedSegment[] = [];
  let segmentStart: number | null = null;

  REPEATED_HOURS.forEach((hour, index) => {
    const isSelected = selectedHours.has(hour);

    if (isSelected && segmentStart === null) {
      segmentStart = index;
    }

    if (!isSelected && segmentStart !== null) {
      segments.push({ startIndex: segmentStart, length: index - segmentStart });
      segmentStart = null;
    }
  });

  if (segmentStart !== null) {
    segments.push({
      startIndex: segmentStart,
      length: REPEATED_HOURS.length - segmentStart,
    });
  }

  return segments;
}

export function ActivityTimeRail({
  id,
  label,
  required = false,
  requiredLabel,
  ranges,
  onToggleHour,
}: ActivityTimeRailProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedHours = useMemo(() => getSelectedActivityHours(ranges), [ranges]);
  const selectedSegments = useMemo(() => getSelectedSegments(selectedHours), [selectedHours]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    if (offsetX < LOOP_START_THRESHOLD) {
      scrollRef.current?.scrollTo({ x: offsetX + CYCLE_WIDTH, animated: false });
    } else if (offsetX > LOOP_END_THRESHOLD) {
      scrollRef.current?.scrollTo({ x: offsetX - CYCLE_WIDTH, animated: false });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Typography variant="bodyM" color={colors.gray[700]}>
          {label}
        </Typography>
        {required && requiredLabel ? (
          <Typography variant="caption" color={colors.secondary}>
            {requiredLabel}
          </Typography>
        ) : null}
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        bounces={false}
        contentOffset={{ x: INITIAL_SCROLL_X, y: 0 }}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View>
          <View style={styles.hourLabels}>
            {REPEATED_HOURS.map((hour, index) => (
              <Typography
                key={`label-${index}-${hour}`}
                variant="caption"
                color={colors.gray[500]}
                style={styles.hourLabel}
              >
                {hour}시
              </Typography>
            ))}
          </View>
          <View style={styles.blocks}>
            <View pointerEvents="none" style={styles.selectionLayer}>
              {selectedSegments.map((segment, index) => {
                const width = segment.length * HOUR_CELL_SIZE;
                const gradientId = `${id}-selected-gradient-${index}`;

                return (
                  <Svg
                    key={`${segment.startIndex}-${segment.length}`}
                    style={[
                      styles.selectedSegment,
                      {
                        left: segment.startIndex * HOUR_CELL_SIZE,
                        width,
                      },
                    ]}
                    width={width}
                    height={HOUR_CELL_SIZE}
                    viewBox={`0 0 ${width} ${HOUR_CELL_SIZE}`}
                  >
                    <RadialGradient
                      id={gradientId}
                      cx={width / 2}
                      cy={HOUR_CELL_SIZE / 2}
                      rx={width / 2}
                      ry={HOUR_CELL_SIZE / 2}
                      gradientUnits="userSpaceOnUse"
                    >
                      <Stop offset="0" stopColor={colors.primary} stopOpacity={0.5} />
                      <Stop offset="1" stopColor={colors.primary} stopOpacity={1} />
                    </RadialGradient>
                    <Rect
                      width={width}
                      height={HOUR_CELL_SIZE}
                      rx={radius['2xs']}
                      fill={`url(#${gradientId})`}
                    />
                  </Svg>
                );
              })}
            </View>
            {REPEATED_HOURS.map((hour, index) => {
              const selected = selectedHours.has(hour);
              const nextHour = REPEATED_HOURS[(index + 1) % REPEATED_HOURS.length];
              const isJoinedToNext = selected && selectedHours.has(nextHour);

              return (
                <Pressable
                  key={`block-${index}-${hour}`}
                  accessibilityLabel={`${label} ${hour}시`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.block, isJoinedToNext && styles.joinedBlock]}
                  onPress={() => onToggleHour(hour)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingRight: 40,
  },
  hourLabels: {
    flexDirection: 'row',
  },
  blocks: {
    position: 'relative',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray[200],
  },
  block: {
    zIndex: 2,
    width: HOUR_CELL_SIZE,
    height: HOUR_CELL_SIZE,
    borderRightWidth: 1,
    borderRightColor: colors.alpha.white50,
  },
  joinedBlock: {
    borderRightColor: colors.alpha.transparent,
  },
  selectionLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  selectedSegment: {
    position: 'absolute',
    top: 0,
  },
  hourLabel: {
    width: HOUR_CELL_SIZE,
  },
});
