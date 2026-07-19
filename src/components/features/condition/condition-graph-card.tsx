import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { getConditionScoreTheme } from '@/domains/condition/score-theme';

import { ConditionBlobGraph } from './condition-blob-graph';

import type { ConditionMetricCard } from '@/domains/condition/model';

interface ConditionGraphCardProps {
  metrics: [ConditionMetricCard, ConditionMetricCard, ConditionMetricCard];
  score: number;
}

const CARD_HEIGHT = 260;

/**
 * 컨디션 그래프 카드 껍데기. padding/border/background와 라벨·그래프 배치만 담당하고,
 * 축·blob 렌더링은 `ConditionBlobGraph`, 좌표 계산은 `domains/condition/graph`에 위임합니다.
 */
export function ConditionGraphCard({ metrics, score }: ConditionGraphCardProps) {
  const { primary, secondary } = getConditionScoreTheme(score);
  const [body, mind, sleep] = metrics;

  return (
    <View style={styles.card}>
      <ConditionBlobGraph
        body={body.progress}
        mind={mind.progress}
        sleep={sleep.progress}
        labels={{ body: body.label, mind: mind.label, sleep: sleep.label }}
        primaryColor={primary}
        secondaryColor={secondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
  },
});
