import { type ImageSourcePropType } from 'react-native';

import { AppBackground } from '@/components/ui/AppBackground';
import { getConditionScoreTheme } from '@/domains/condition/score-theme';

const conditionBackgroundSources = {
  excellent: require('../../../../assets/images/condition/condition-100.png'),
  good: require('../../../../assets/images/condition/condition-80.png'),
  steady: require('../../../../assets/images/condition/condition-60.png'),
  low: require('../../../../assets/images/condition/condition-40.png'),
  critical: require('../../../../assets/images/condition/condition-20.png'),
} satisfies Record<ReturnType<typeof getConditionScoreTheme>['tone'], ImageSourcePropType>;

/** Figma의 컨디션 점수 상태별 배경 이미지를 화면에 적용합니다. */
export function ConditionBackground({ score }: { score: number }) {
  const scoreTheme = getConditionScoreTheme(Math.max(0, score));

  return <AppBackground imageSource={conditionBackgroundSources[scoreTheme.tone]} />;
}
