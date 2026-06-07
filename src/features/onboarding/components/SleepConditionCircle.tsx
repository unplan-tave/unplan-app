import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';
import { t } from '@/lib/i18n';

interface SleepConditionCircleProps {
  targetSleepMinutes: number;
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}시간 ${minutes}분`;
}

export function SleepConditionCircle({ targetSleepMinutes }: SleepConditionCircleProps) {
  return (
    <View style={styles.container}>
      <Typography variant="bodyS" color={colors.gray[500]} align="center">
        0 시간
      </Typography>
      <View style={styles.row}>
        <Typography variant="bodyS" color={colors.gray[500]} style={styles.leftAxis}>
          9 시간
        </Typography>
        <View style={styles.circle}>
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
          <View style={styles.targetLine}>
            <View style={styles.targetBadge}>
              <Typography variant="caption" color={colors.gray.white}>
                {formatMinutes(targetSleepMinutes)}
              </Typography>
            </View>
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
        <LegendItem color={colors.secondary} label={t('onboarding.sleep.legendTarget')} />
        <LegendItem color="#6C5DA1" label={t('onboarding.sleep.risk')} />
        <LegendItem color="#47B399" label={t('onboarding.sleep.lack')} />
        <LegendItem color={colors.primary} label={t('onboarding.sleep.good')} />
        <LegendItem color={colors.gray[200]} label={t('onboarding.sleep.excess')} />
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
    width: 300,
    height: 300,
    overflow: 'hidden',
    borderRadius: 150,
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
    backgroundColor: '#D9DFE5',
  },
  risk: {
    right: 0,
    top: 0,
    backgroundColor: '#8A7AB9',
  },
  good: {
    left: 0,
    bottom: 0,
    backgroundColor: '#7EC2F6',
  },
  lack: {
    right: 0,
    bottom: 0,
    backgroundColor: '#91D2C4',
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
    left: 52,
    top: 200,
    width: 124,
    height: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  targetBadge: {
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
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
