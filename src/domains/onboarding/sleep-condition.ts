/**
 * onboarding/settings의 수면 컨디션 원형 입력을 위한 순수 계산입니다.
 * 수면 시간 threshold와 목표 수면 시간을 risk/lack/good/excess 상태로 분류합니다.
 */
export type SleepCondition = 'risk' | 'lack' | 'good' | 'excess';

export const SLEEP_CONDITION_VISIBLE_MAX_MINUTES = 12 * 60;
export const SLEEP_CONDITION_STEP_MINUTES = 30;
/** 시계에서 한 컨디션 구간이 표시할 수 있는 최대 길이입니다. */
export const SLEEP_CONDITION_MAX_RANGE_MINUTES = 10 * 60 + 30;
export const SLEEP_CONDITION_EDITABLE_MIN_MINUTES =
  SLEEP_CONDITION_VISIBLE_MAX_MINUTES - SLEEP_CONDITION_MAX_RANGE_MINUTES;
export const SLEEP_CONDITION_EDITABLE_MAX_MINUTES =
  SLEEP_CONDITION_VISIBLE_MAX_MINUTES - SLEEP_CONDITION_STEP_MINUTES;

export interface SleepConditionThresholds {
  dangerMinutes: number;
  lackMinutes: number;
  optimalMinutes: number;
}

export const DEFAULT_SLEEP_CONDITION_THRESHOLDS: SleepConditionThresholds = {
  dangerMinutes: 3 * 60,
  lackMinutes: 6 * 60,
  optimalMinutes: 9 * 60,
};

/** 분 → "3시간 0분" (0분이면 "0시간") */
export function formatSleepDurationLabel(totalMinutes: number): string {
  if (totalMinutes === 0) {
    return '0시간';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}시간 ${minutes}분`;
}

export function classifySleepMinutes(
  minutes: number,
  thresholds: SleepConditionThresholds = DEFAULT_SLEEP_CONDITION_THRESHOLDS,
): SleepCondition {
  if (minutes < thresholds.dangerMinutes) {
    return 'risk';
  }

  if (minutes < thresholds.lackMinutes) {
    return 'lack';
  }

  if (minutes < thresholds.optimalMinutes) {
    return 'good';
  }

  // Figma spec: durations beyond the visible 12-hour range are still classified as excess.
  return 'excess';
}
