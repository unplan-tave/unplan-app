import { type ImageSourcePropType } from 'react-native';

import { AppBackground } from '@/components/ui/AppBackground';
import { getConditionScoreTheme } from '@/domains/condition/score-theme';

/** 컨디션 점수 상태(5단계)별 전면 배경 이미지. 홈·카드리스트·컨디션이 공유합니다. */
const conditionBackgroundSources = {
  excellent: require('../../../../assets/images/condition/condition-100.png'),
  good: require('../../../../assets/images/condition/condition-80.png'),
  steady: require('../../../../assets/images/condition/condition-60.png'),
  low: require('../../../../assets/images/condition/condition-40.png'),
  critical: require('../../../../assets/images/condition/condition-20.png'),
} satisfies Record<ReturnType<typeof getConditionScoreTheme>['tone'], ImageSourcePropType>;

/** 컨디션 점수에 따라 Figma의 5가지 배경 중 하나를 화면에 깝니다. */
export function ConditionScoreBackground({ score }: { score?: number | null }) {
  const scoreTheme = getConditionScoreTheme(score == null ? score : Math.max(0, score));

  return <AppBackground imageSource={conditionBackgroundSources[scoreTheme.tone]} />;
}
