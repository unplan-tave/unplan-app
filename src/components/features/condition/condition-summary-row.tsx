import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

interface ConditionSummaryRowProps {
  bodyPercent: number;
  mindPercent: number;
}

/** 기록 내역 Body/Mind 탭 상단의 'Body n% | Mind n%' 요약입니다. */
export function ConditionSummaryRow({ bodyPercent, mindPercent }: ConditionSummaryRowProps) {
  return (
    <View style={styles.row}>
      <Typography variant="bodyM" color={colors.gray[700]}>
        {`Body ${bodyPercent}%`}
      </Typography>
      <View style={styles.divider} />
      <Typography variant="bodyM" color={colors.gray[700]}>
        {`Mind ${mindPercent}%`}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: colors.gray[300],
  },
});
