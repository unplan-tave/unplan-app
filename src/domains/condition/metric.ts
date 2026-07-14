import { type ConditionSummary } from '@/domains/measurement/model';

import { type ConditionMetricCard, type ConditionMetricKey } from './model';

const HIGH_THRESHOLD = 70;
const LOW_THRESHOLD = 40;

const METRIC_LABEL: Record<ConditionMetricKey, string> = {
  body: 'Body',
  mind: 'Mind',
  sleep: 'Sleep',
};

/** 컨디션 요약(ConditionSummary)을 Body/Mind/Sleep 게이지 카드 3장으로 변환합니다. */
export function toConditionMetricCards(
  summary: ConditionSummary,
): [ConditionMetricCard, ConditionMetricCard, ConditionMetricCard] {
  return [
    toMetricCard('body', summary.body.value, summary.body.progress),
    toMetricCard('mind', summary.mind.value, summary.mind.progress),
    toMetricCard('sleep', summary.sleep.value, summary.sleep.progress),
  ];
}

function toMetricCard(
  key: ConditionMetricKey,
  value: string,
  progress: number,
): ConditionMetricCard {
  return {
    key,
    label: METRIC_LABEL[key],
    value,
    progress: clampProgress(progress),
    comment: getConditionMetricComment(key, progress),
  };
}

/** 게이지 값에 대응하는 Figma 코멘트 문구. */
export function getConditionMetricComment(key: ConditionMetricKey, progress: number): string {
  if (key === 'sleep') {
    if (progress >= HIGH_THRESHOLD) {
      return '수면 시간 충분';
    }

    return progress >= LOW_THRESHOLD ? '수면 시간 보통' : '수면 시간 부족';
  }

  if (progress >= HIGH_THRESHOLD) {
    return '에너지가 넘쳐요!';
  }

  return progress >= LOW_THRESHOLD ? '에너지 보통' : '에너지 부족';
}

export function clampProgress(progress: number): number {
  return Math.min(100, Math.max(0, progress));
}
