export type SleepCondition = 'risk' | 'lack' | 'good' | 'excess';

export const SLEEP_CONDITION_VISIBLE_MAX_MINUTES = 12 * 60;
export const SLEEP_CONDITION_EDITABLE_MAX_MINUTES = 10 * 60 + 30;
export const SLEEP_CONDITION_STEP_MINUTES = 30;
export const SLEEP_EXCESS_MIN_START_MINUTES = 9 * 60;

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
