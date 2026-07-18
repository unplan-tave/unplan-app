/**
 * measurement 요약 값을 condition 화면의 Body/Mind/Sleep 카드 모델로 변환합니다.
 * 표시 라벨, 진행률, 짧은 코멘트 계산은 UI가 아니라 이 도메인 함수에서 고정합니다.
 */
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
    toMetricCard('body', summary.body.value, summary.body.progress, summary.body.comment),
    toMetricCard('mind', summary.mind.value, summary.mind.progress, summary.mind.comment),
    toMetricCard('sleep', summary.sleep.value, summary.sleep.progress, summary.sleep.comment),
  ];
}

function toMetricCard(
  key: ConditionMetricKey,
  value: string,
  progress: number,
  comment: string,
): ConditionMetricCard {
  // API가 내려준 개별 기록 문구를 우선 쓰고, 기록이 없으면 게이지 기준 문구로 대체합니다.
  const resolvedComment =
    comment.trim().length > 0 ? comment : getConditionMetricComment(key, progress);

  return {
    key,
    label: METRIC_LABEL[key],
    value,
    progress: clampProgress(progress),
    comment: resolvedComment,
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
