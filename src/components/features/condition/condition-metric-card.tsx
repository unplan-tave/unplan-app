import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import {
  CONDITION_METRIC_CARD_HEIGHT,
  CONDITION_METRIC_GAUGE_HEIGHT,
} from '@/constants/condition-ui';
import { colors, radius, spacing } from '@/constants/theme';

import type { ConditionMetricCard as ConditionMetricCardModel } from '@/domains/condition/model';

interface ConditionMetricCardProps {
  metric: ConditionMetricCardModel;
}

/** Body / Mind / Sleep 각각의 값·게이지·코멘트를 보여주는 카드. */
export function ConditionMetricCard({ metric }: ConditionMetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Typography variant="bodyS" color={colors.gray[600]}>
          {metric.label}
        </Typography>
        <View style={styles.divider} />
        <Typography variant="bodyS" color={colors.gray[700]}>
          {metric.value}
        </Typography>
      </View>
      <View style={styles.gaugeTrack}>
        <View style={[styles.gaugeFill, { width: `${metric.progress}%` }]} />
      </View>
      <Typography variant="caption" color={colors.gray[800]}>
        {metric.comment}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: CONDITION_METRIC_CARD_HEIGHT,
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white20,
    shadowColor: colors.shadow.blueGray,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 48,
    elevation: 6,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: colors.gray[300],
  },
  gaugeTrack: {
    height: CONDITION_METRIC_GAUGE_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.alpha.gray50020,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.gray[500],
  },
});
