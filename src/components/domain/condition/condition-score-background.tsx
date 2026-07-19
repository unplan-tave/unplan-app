import { AppBackground } from '@/components/ui/AppBackground';
import { CONDITION_SCORE_BACKGROUND_SOURCES } from '@/constants/condition-ui';
import { getConditionScoreTheme } from '@/domains/condition/score-theme';

/** 컨디션 점수에 따라 Figma의 5가지 배경 중 하나를 화면에 깝니다. */
export function ConditionScoreBackground({ score }: { score?: number | null }) {
  if (score == null) {
    return <AppBackground />;
  }

  const scoreTheme = getConditionScoreTheme(Math.max(0, score));
  const imageSource =
    scoreTheme.tone === 'neutral' ? undefined : CONDITION_SCORE_BACKGROUND_SOURCES[scoreTheme.tone];

  return <AppBackground imageSource={imageSource} />;
}
