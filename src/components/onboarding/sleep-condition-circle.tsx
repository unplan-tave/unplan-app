import { useCallback, useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';
import { t } from '@/lib/i18n';
import {
  classifySleepMinutes,
  SLEEP_CONDITION_EDITABLE_MAX_MINUTES,
  SLEEP_CONDITION_STEP_MINUTES,
  SLEEP_CONDITION_VISIBLE_MAX_MINUTES,
  SLEEP_EXCESS_MIN_START_MINUTES,
  type SleepCondition,
  type SleepConditionThresholds,
} from '@/state/onboarding/sleep-condition';

interface SleepConditionCircleProps {
  targetSleepMinutes: number;
  dangerThresholdMinutes: number;
  lackThresholdMinutes: number;
  optimalThresholdMinutes: number;
  onTargetSleepMinutesChange: (minutes: number) => void;
  onThresholdsChange: (thresholds: SleepConditionThresholds) => void;
}

type DraggableLine = 'danger' | 'lack' | 'target' | 'optimal';

const CIRCLE_SIZE = 300;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const THRESHOLD_LINE_LENGTH = 150;
const THRESHOLD_CONTAINER_WIDTH = 152;
const THRESHOLD_CONTAINER_HEIGHT = 26;
const LABEL_RADIUS = 42;
const MINIMUM_LABEL_RANGE_MINUTES = 90;
const MINIMUM_RANGE_MINUTES = SLEEP_CONDITION_STEP_MINUTES;

const sleepConditionColors = {
  target: colors.secondary,
  risk: '#8A7AB9',
  lack: '#91D2C4',
  good: colors.primary,
  excess: colors.gray[200],
} as const;

const sleepConditionLabelKeys: Record<SleepCondition, Parameters<typeof t>[0]> = {
  risk: 'onboarding.sleep.risk',
  lack: 'onboarding.sleep.lack',
  good: 'onboarding.sleep.good',
  excess: 'onboarding.sleep.excess',
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function snapMinutes(minutes: number) {
  return Math.round(minutes / SLEEP_CONDITION_STEP_MINUTES) * SLEEP_CONDITION_STEP_MINUTES;
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}시간 ${minutes}분`;
}

function getMinutesFromLocation(locationX: number, locationY: number) {
  const deltaX = locationX - CIRCLE_RADIUS;
  const deltaY = locationY - CIRCLE_RADIUS;
  const angleFromRight = Math.atan2(deltaY, deltaX);
  const clockwiseFromTop = (angleFromRight + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const rawMinutes = (clockwiseFromTop / (Math.PI * 2)) * SLEEP_CONDITION_VISIBLE_MAX_MINUTES;

  return snapMinutes(rawMinutes);
}

function getAngle(minutes: number) {
  return (minutes / SLEEP_CONDITION_VISIBLE_MAX_MINUTES) * Math.PI * 2 - Math.PI / 2;
}

function getPoint(minutes: number, radius: number) {
  const angle = getAngle(minutes);

  return {
    x: CIRCLE_RADIUS + Math.cos(angle) * radius,
    y: CIRCLE_RADIUS + Math.sin(angle) * radius,
  };
}

function describeSector(startMinutes: number, endMinutes: number) {
  const start = getPoint(startMinutes, CIRCLE_RADIUS);
  const end = getPoint(endMinutes, CIRCLE_RADIUS);
  const duration = endMinutes - startMinutes;
  const largeArcFlag = duration > SLEEP_CONDITION_VISIBLE_MAX_MINUTES / 2 ? 1 : 0;

  return [
    `M ${CIRCLE_RADIUS} ${CIRCLE_RADIUS}`,
    `L ${start.x} ${start.y}`,
    `A ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function circularDistance(first: number, second: number) {
  const distance = Math.abs(first - second);

  return Math.min(distance, SLEEP_CONDITION_VISIBLE_MAX_MINUTES - distance);
}

function findNearestLine(minutes: number, values: Record<DraggableLine, number>): DraggableLine {
  return (Object.keys(values) as DraggableLine[]).reduce((nearest, current) =>
    circularDistance(minutes, values[current]) < circularDistance(minutes, values[nearest])
      ? current
      : nearest,
  );
}

function getLabelPosition(startMinutes: number, endMinutes: number) {
  const midpoint = startMinutes + (endMinutes - startMinutes) / 2;
  const point = getPoint(midpoint, LABEL_RADIUS);

  return {
    left: point.x - 28,
    top: point.y - 14,
  };
}

function getLineRotation(minutes: number) {
  return (getAngle(minutes) * 180) / Math.PI;
}

export function SleepConditionCircle({
  targetSleepMinutes,
  dangerThresholdMinutes,
  lackThresholdMinutes,
  optimalThresholdMinutes,
  onTargetSleepMinutesChange,
  onThresholdsChange,
}: SleepConditionCircleProps) {
  const activeLineRef = useRef<DraggableLine | null>(null);
  const thresholds = useMemo(
    () => ({
      dangerMinutes: dangerThresholdMinutes,
      lackMinutes: lackThresholdMinutes,
      optimalMinutes: optimalThresholdMinutes,
    }),
    [dangerThresholdMinutes, lackThresholdMinutes, optimalThresholdMinutes],
  );
  const lineValues = useMemo<Record<DraggableLine, number>>(
    () => ({
      danger: dangerThresholdMinutes,
      lack: lackThresholdMinutes,
      target: targetSleepMinutes,
      optimal: optimalThresholdMinutes,
    }),
    [dangerThresholdMinutes, lackThresholdMinutes, optimalThresholdMinutes, targetSleepMinutes],
  );

  const updateLine = useCallback(
    (line: DraggableLine, rawMinutes: number) => {
      if (line === 'danger') {
        onThresholdsChange({
          ...thresholds,
          dangerMinutes: clamp(
            rawMinutes,
            MINIMUM_RANGE_MINUTES,
            lackThresholdMinutes - MINIMUM_RANGE_MINUTES,
          ),
        });
        return;
      }

      if (line === 'lack') {
        const nextLackMinutes = clamp(
          rawMinutes,
          dangerThresholdMinutes + MINIMUM_RANGE_MINUTES,
          optimalThresholdMinutes - MINIMUM_RANGE_MINUTES,
        );

        onThresholdsChange({
          ...thresholds,
          lackMinutes: nextLackMinutes,
        });

        if (targetSleepMinutes < nextLackMinutes) {
          onTargetSleepMinutesChange(nextLackMinutes);
        }
        return;
      }

      if (line === 'optimal') {
        const nextOptimalMinutes = clamp(
          rawMinutes,
          Math.max(SLEEP_EXCESS_MIN_START_MINUTES, lackThresholdMinutes + MINIMUM_RANGE_MINUTES),
          SLEEP_CONDITION_EDITABLE_MAX_MINUTES,
        );

        onThresholdsChange({
          ...thresholds,
          optimalMinutes: nextOptimalMinutes,
        });

        if (targetSleepMinutes > nextOptimalMinutes) {
          onTargetSleepMinutesChange(nextOptimalMinutes);
        }
        return;
      }

      onTargetSleepMinutesChange(clamp(rawMinutes, lackThresholdMinutes, optimalThresholdMinutes));
    },
    [
      dangerThresholdMinutes,
      lackThresholdMinutes,
      onTargetSleepMinutesChange,
      onThresholdsChange,
      optimalThresholdMinutes,
      targetSleepMinutes,
      thresholds,
    ],
  );

  const dragStateRef = useRef({ lineValues, updateLine });
  dragStateRef.current = { lineValues, updateLine };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const minutes = getMinutesFromLocation(locationX, locationY);
          const { lineValues: currentLineValues, updateLine: currentUpdateLine } =
            dragStateRef.current;
          const nearestLine = findNearestLine(minutes, currentLineValues);

          activeLineRef.current = nearestLine;
          currentUpdateLine(nearestLine, minutes);
        },
        onPanResponderMove: (event) => {
          const activeLine = activeLineRef.current;

          if (!activeLine) {
            return;
          }

          const { locationX, locationY } = event.nativeEvent;
          dragStateRef.current.updateLine(activeLine, getMinutesFromLocation(locationX, locationY));
        },
        onPanResponderRelease: () => {
          activeLineRef.current = null;
        },
        onPanResponderTerminate: () => {
          activeLineRef.current = null;
        },
      }),
    [],
  );

  const targetSleepCondition = classifySleepMinutes(targetSleepMinutes, thresholds);
  const sectors = [
    {
      condition: 'risk' as const,
      start: 0,
      end: dangerThresholdMinutes,
    },
    {
      condition: 'lack' as const,
      start: dangerThresholdMinutes,
      end: lackThresholdMinutes,
    },
    {
      condition: 'good' as const,
      start: lackThresholdMinutes,
      end: optimalThresholdMinutes,
    },
    {
      condition: 'excess' as const,
      start: optimalThresholdMinutes,
      end: SLEEP_CONDITION_VISIBLE_MAX_MINUTES,
    },
  ];

  return (
    <View style={styles.container}>
      <AxisLabel value="0" />
      <View style={styles.row}>
        <AxisLabel value="9" style={styles.leftAxis} />
        <View
          {...panResponder.panHandlers}
          accessibilityActions={[
            { name: 'increment', label: '목표 수면 시간 30분 늘리기' },
            { name: 'decrement', label: '목표 수면 시간 30분 줄이기' },
          ]}
          accessibilityLabel="수면 시간별 컨디션 기준선"
          accessibilityRole="adjustable"
          accessibilityValue={{
            text: `${formatMinutes(targetSleepMinutes)}, ${t(sleepConditionLabelKeys[targetSleepCondition])}`,
          }}
          onAccessibilityAction={(event) => {
            const delta =
              event.nativeEvent.actionName === 'increment'
                ? SLEEP_CONDITION_STEP_MINUTES
                : -SLEEP_CONDITION_STEP_MINUTES;

            updateLine('target', targetSleepMinutes + delta);
          }}
          style={styles.circle}
        >
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
            {sectors.map((sector) => (
              <Path
                key={sector.condition}
                d={describeSector(sector.start, sector.end)}
                fill={sleepConditionColors[sector.condition]}
              />
            ))}
          </Svg>

          {(['danger', 'lack', 'optimal', 'target'] as DraggableLine[]).map((line) => {
            const rotation = getLineRotation(lineValues[line]);
            const shouldReverseText = rotation > 90 || rotation <= -90;

            return (
              <View
                key={line}
                pointerEvents="none"
                style={[
                  styles.thresholdContainer,
                  {
                    transform: [{ rotate: `${rotation}deg` }],
                  },
                ]}
              >
                <View
                  style={[styles.thresholdLine, line === 'target' && styles.targetThresholdLine]}
                />
                <View
                  style={[
                    styles.timeBadge,
                    line === 'target' && styles.targetBadge,
                    shouldReverseText && styles.reversedBadge,
                  ]}
                >
                  <TimeBadgeContent
                    minutes={lineValues[line]}
                    color={line === 'target' ? colors.gray.white : colors.gray[700]}
                  />
                </View>
              </View>
            );
          })}

          {sectors.map((sector) =>
            sector.end - sector.start >= MINIMUM_LABEL_RANGE_MINUTES ? (
              <Typography
                key={sector.condition}
                pointerEvents="none"
                variant="titleS"
                align="center"
                color={sector.condition === 'excess' ? colors.gray[400] : colors.gray.white}
                style={[styles.conditionLabel, getLabelPosition(sector.start, sector.end)]}
              >
                {t(sleepConditionLabelKeys[sector.condition])}
              </Typography>
            ) : null,
          )}
        </View>
        <AxisLabel value="3" style={styles.rightAxis} />
      </View>
      <AxisLabel value="6" />

      <View style={styles.legend}>
        <LegendItem
          color={sleepConditionColors.target}
          label={t('onboarding.sleep.legendTarget')}
        />
        <LegendItem color={sleepConditionColors.risk} label={t('onboarding.sleep.risk')} />
        <LegendItem color={sleepConditionColors.lack} label={t('onboarding.sleep.lack')} />
        <LegendItem color={sleepConditionColors.good} label={t('onboarding.sleep.good')} />
        <LegendItem color={sleepConditionColors.excess} label={t('onboarding.sleep.excess')} />
      </View>
    </View>
  );
}

function AxisLabel({ value, style }: { value: string; style?: object }) {
  return (
    <View style={[styles.axisLabel, style]}>
      <Typography variant="titleS" color={colors.gray[500]}>
        {value}
      </Typography>
      <Typography variant="caption" color={colors.gray[400]}>
        시간
      </Typography>
    </View>
  );
}

function TimeBadgeContent({ minutes, color }: { minutes: number; color: string }) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return (
    <>
      <View style={styles.badgeValue}>
        <Typography variant="bodyM" color={color}>
          {hours}
        </Typography>
        <Typography variant="caption" color={color}>
          시간
        </Typography>
      </View>
      <View style={styles.badgeValue}>
        <Typography variant="bodyM" color={color}>
          {remainingMinutes}
        </Typography>
        <Typography variant="caption" color={color}>
          분
        </Typography>
      </View>
    </>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Typography variant="bodyS" color={colors.gray[500]}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 21,
  },
  row: {
    width: 362,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    overflow: 'visible',
    borderRadius: CIRCLE_RADIUS,
    backgroundColor: colors.gray[200],
  },
  axisLabel: {
    height: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  leftAxis: {
    width: 29,
    transform: [{ rotate: '-90deg' }],
  },
  rightAxis: {
    width: 29,
    transform: [{ rotate: '90deg' }],
  },
  conditionLabel: {
    position: 'absolute',
    width: 56,
  },
  thresholdContainer: {
    position: 'absolute',
    left: CIRCLE_RADIUS,
    top: CIRCLE_RADIUS - THRESHOLD_CONTAINER_HEIGHT / 2,
    width: THRESHOLD_CONTAINER_WIDTH,
    height: THRESHOLD_CONTAINER_HEIGHT,
    transformOrigin: [0, THRESHOLD_CONTAINER_HEIGHT / 2, 0],
    justifyContent: 'center',
  },
  thresholdLine: {
    position: 'absolute',
    left: 0,
    width: THRESHOLD_LINE_LENGTH,
    height: 1,
    backgroundColor: colors.gray.white,
  },
  targetThresholdLine: {
    height: 2,
    backgroundColor: sleepConditionColors.target,
  },
  timeBadge: {
    position: 'absolute',
    right: 0,
    height: THRESHOLD_CONTAINER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.gray.white,
    shadowColor: colors.gray[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  reversedBadge: {
    transform: [{ rotate: '180deg' }],
  },
  targetBadge: {
    backgroundColor: sleepConditionColors.target,
  },
  badgeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  legend: {
    width: 238,
    marginTop: 24,
    paddingHorizontal: 36,
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 8,
    backgroundColor: colors.gray.white,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
