export type SleepCondition = 'risk' | 'lack' | 'good' | 'excess';

export const SLEEP_CONDITION_VISIBLE_MAX_MINUTES = 12 * 60;

const SLEEP_RISK_MAX_MINUTES = 3 * 60;
const SLEEP_LACK_MAX_MINUTES = 6 * 60;
const SLEEP_GOOD_MAX_MINUTES = 9 * 60;

export function classifySleepMinutes(minutes: number): SleepCondition {
  if (minutes < SLEEP_RISK_MAX_MINUTES) {
    return 'risk';
  }

  if (minutes < SLEEP_LACK_MAX_MINUTES) {
    return 'lack';
  }

  if (minutes < SLEEP_GOOD_MAX_MINUTES) {
    return 'good';
  }

  // Figma spec: durations beyond the visible 12-hour range are still classified as excess.
  return 'excess';
}
