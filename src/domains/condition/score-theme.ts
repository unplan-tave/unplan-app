import { colors } from '@/constants/theme';

/** 컨디션 점수를 Figma의 다섯 가지 색상 상태로 정규화합니다. */
export type ConditionScoreTone = 'excellent' | 'good' | 'steady' | 'low' | 'critical';

/** 점수별 배경과 방사형 그래프가 공유하는 색상 조합입니다. */
export function getConditionScoreTheme(score: number | null | undefined): {
  tone: ConditionScoreTone;
  primary: string;
  secondary: string;
} {
  if (score == null || score >= 81) {
    return { tone: 'excellent', primary: colors.gradient.blue, secondary: colors.gradient.sky };
  }

  if (score >= 61) {
    return { tone: 'good', primary: colors.gradient.sky, secondary: colors.gradient.blue };
  }

  if (score >= 41) {
    return { tone: 'steady', primary: colors.gradient.green, secondary: colors.gradient.sky };
  }

  if (score >= 21) {
    return { tone: 'low', primary: colors.gradient.purple, secondary: colors.gradient.deepPurple };
  }

  return {
    tone: 'critical',
    primary: colors.gradient.deepPurple,
    secondary: colors.gradient.purple,
  };
}
