import { useCallback, useMemo } from 'react';
import { type GestureResponderEvent, PanResponder, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';
import { t } from '@/lib/i18n';
import {
  classifySleepMinutes,
  SLEEP_CONDITION_VISIBLE_MAX_MINUTES,
  type SleepCondition,
} from '@/state/onboarding/sleep-condition';

interface SleepConditionCircleProps {
  targetSleepMinutes: number;
  onTargetSleepMinutesChange: (minutes: number) => void;
}

const CIRCLE_SIZE = 300;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const TARGET_LINE_LENGTH = 212;
const SLEEP_STEP_MINUTES = 15;
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

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}시간 ${minutes}분`;
}

function clampTargetSleepMinutes(minutes: number) {
  return Math.max(0, Math.min(SLEEP_CONDITION_VISIBLE_MAX_MINUTES, minutes));
}

function getTargetSleepMinutesFromLocation(locationX: number, locationY: number) {
  const deltaX = locationX - CIRCLE_RADIUS;
  const deltaY = locationY - CIRCLE_RADIUS;
  const angleFromRight = Math.atan2(deltaY, deltaX);
  const clockwiseFromTop = (angleFromRight + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const rawMinutes = (clockwiseFromTop / (Math.PI * 2)) * SLEEP_CONDITION_VISIBLE_MAX_MINUTES;

  return clampTargetSleepMinutes(Math.round(rawMinutes / SLEEP_STEP_MINUTES) * SLEEP_STEP_MINUTES);
}

function getTargetGeometry(targetSleepMinutes: number) {
  const clampedMinutes = clampTargetSleepMinutes(targetSleepMinutes);
  const angle = (clampedMinutes / SLEEP_CONDITION_VISIBLE_MAX_MINUTES) * Math.PI * 2 - Math.PI / 2;
  const badgeRadius = CIRCLE_RADIUS - 42;

  return {
    lineRotation: `${angle}rad`,
    badgeLeft: CIRCLE_RADIUS + Math.cos(angle) * badgeRadius - 34,
    badgeTop: CIRCLE_RADIUS + Math.sin(angle) * badgeRadius - 12,
  };
}

export function SleepConditionCircle({
  targetSleepMinutes,
  onTargetSleepMinutesChange,
}: SleepConditionCircleProps) {
  const targetGeometry = getTargetGeometry(targetSleepMinutes);
  const targetSleepCondition = classifySleepMinutes(targetSleepMinutes);
  const updateTargetFromEvent = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      onTargetSleepMinutesChange(getTargetSleepMinutesFromLocation(locationX, locationY));
    },
    [onTargetSleepMinutesChange],
  );
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: updateTargetFromEvent,
        onPanResponderMove: updateTargetFromEvent,
      }),
    [updateTargetFromEvent],
  );
  const handleAccessibilityAction = useCallback(
    (event: { nativeEvent: { actionName: string } }) => {
      const delta =
        event.nativeEvent.actionName === 'increment' ? SLEEP_STEP_MINUTES : -SLEEP_STEP_MINUTES;

      onTargetSleepMinutesChange(clampTargetSleepMinutes(targetSleepMinutes + delta));
    },
    [onTargetSleepMinutesChange, targetSleepMinutes],
  );

  return (
    <View style={styles.container}>
      <Typography variant="bodyS" color={colors.gray[500]} align="center">
        0 시간
      </Typography>
      <View style={styles.row}>
        <Typography variant="bodyS" color={colors.gray[500]} style={styles.leftAxis}>
          9 시간
        </Typography>
        <View
          {...panResponder.panHandlers}
          accessibilityActions={[
            { name: 'increment', label: '15분 늘리기' },
            { name: 'decrement', label: '15분 줄이기' },
          ]}
          accessibilityLabel="목표 수면 기준선"
          accessibilityRole="adjustable"
          accessibilityValue={{
            text: `${formatMinutes(targetSleepMinutes)}, ${t(sleepConditionLabelKeys[targetSleepCondition])}`,
          }}
          onAccessibilityAction={handleAccessibilityAction}
          style={styles.circle}
        >
          <View style={[styles.quadrant, styles.excess]} />
          <View style={[styles.quadrant, styles.risk]} />
          <View style={[styles.quadrant, styles.good]} />
          <View style={[styles.quadrant, styles.lack]} />
          <Typography variant="titleS" color={colors.gray[400]} style={styles.excessLabel}>
            {t('onboarding.sleep.excess')}
          </Typography>
          <Typography variant="titleS" color={colors.gray.white} style={styles.riskLabel}>
            {t('onboarding.sleep.risk')}
          </Typography>
          <Typography variant="titleS" color={colors.gray.white} style={styles.goodLabel}>
            {t('onboarding.sleep.good')}
          </Typography>
          <Typography variant="titleS" color={colors.gray.white} style={styles.lackLabel}>
            {t('onboarding.sleep.lack')}
          </Typography>
          <View
            style={[
              styles.targetLine,
              {
                transform: [{ rotate: targetGeometry.lineRotation }],
              },
            ]}
          />
          <View
            style={[
              styles.targetBadge,
              {
                left: targetGeometry.badgeLeft,
                top: targetGeometry.badgeTop,
              },
            ]}
          >
            <Typography variant="caption" color={colors.gray.white}>
              {formatMinutes(targetSleepMinutes)}
            </Typography>
          </View>
          <View style={[styles.timeBadge, styles.badgeLeft]}>
            <Typography variant="bodyM" color={colors.gray[700]}>
              9
            </Typography>
            <Typography variant="caption" color={colors.gray[500]}>
              시간 0분
            </Typography>
          </View>
          <View style={[styles.timeBadge, styles.badgeRight]}>
            <Typography variant="bodyM" color={colors.gray[700]}>
              3
            </Typography>
            <Typography variant="caption" color={colors.gray[500]}>
              시간 0분
            </Typography>
          </View>
          <View style={[styles.timeBadge, styles.badgeBottom]}>
            <Typography variant="bodyM" color={colors.gray[700]}>
              6
            </Typography>
            <Typography variant="caption" color={colors.gray[500]}>
              시간 0분
            </Typography>
          </View>
        </View>
        <Typography variant="bodyS" color={colors.gray[500]} style={styles.rightAxis}>
          3 시간
        </Typography>
      </View>
      <Typography variant="bodyS" color={colors.gray[500]} align="center">
        6 시간
      </Typography>
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
    marginTop: 35,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAxis: {
    width: 29,
    transform: [{ rotate: '-90deg' }],
  },
  rightAxis: {
    width: 29,
    transform: [{ rotate: '90deg' }],
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    overflow: 'hidden',
    borderRadius: CIRCLE_RADIUS,
    backgroundColor: colors.gray[200],
  },
  quadrant: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  excess: {
    left: 0,
    top: 0,
    backgroundColor: sleepConditionColors.excess,
  },
  risk: {
    right: 0,
    top: 0,
    backgroundColor: sleepConditionColors.risk,
  },
  good: {
    left: 0,
    bottom: 0,
    backgroundColor: sleepConditionColors.good,
  },
  lack: {
    right: 0,
    bottom: 0,
    backgroundColor: sleepConditionColors.lack,
  },
  excessLabel: {
    position: 'absolute',
    left: 90,
    top: 94,
  },
  riskLabel: {
    position: 'absolute',
    left: 184,
    top: 94,
  },
  goodLabel: {
    position: 'absolute',
    left: 96,
    top: 151,
  },
  lackLabel: {
    position: 'absolute',
    left: 184,
    top: 151,
  },
  targetLine: {
    position: 'absolute',
    left: CIRCLE_RADIUS - TARGET_LINE_LENGTH / 2,
    top: CIRCLE_RADIUS - 1,
    width: TARGET_LINE_LENGTH,
    height: 2,
    borderRadius: 1,
    backgroundColor: sleepConditionColors.target,
  },
  targetBadge: {
    position: 'absolute',
    minWidth: 68,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: sleepConditionColors.target,
  },
  timeBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.gray.white,
  },
  badgeLeft: {
    left: 0,
    top: 137,
  },
  badgeRight: {
    right: 0,
    top: 137,
  },
  badgeBottom: {
    left: 128,
    bottom: 0,
    transform: [{ rotate: '90deg' }],
  },
  legend: {
    width: 238,
    marginTop: 30,
    paddingHorizontal: 36,
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
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
