/**
 * onboarding 도메인의 화면 모델입니다.
 * 최초 설정 저장과 settings 수정 화면이 공유하는 선호값, 이동수단, 회복수단 타입을 정의합니다.
 */
export type RecoveryOptionId = 'nap' | 'music' | 'walk' | 'stretching' | 'food' | 'custom';

export type TransportOptionId = 'walk' | 'bicycle' | 'publicTransit' | 'car';

export interface TimeRange {
  startHour: number;
  endHour: number;
}

export interface RecoveryMethodsSettings {
  recoveryOptionIds: Exclude<RecoveryOptionId, 'custom'>[];
  customMethods: string[];
}

export interface SleepConditionSettings {
  targetSleepMinutes: number;
  dangerThresholdMinutes: number;
  lackThresholdMinutes: number;
  optimalThresholdMinutes: number;
}

export interface ActivityPatternSettings {
  focusTimeRanges: TimeRange[];
  sleepyTimeRanges: TimeRange[];
  sleepTimeRanges: TimeRange[];
}

export interface OnboardingPreferences {
  recoveryOptionIds: RecoveryOptionId[];
  customRecoveryLabel: string | null;
  targetSleepMinutes: number;
  sleepDangerThresholdMinutes: number;
  sleepLackThresholdMinutes: number;
  sleepOptimalThresholdMinutes: number;
  focusTimeRanges: TimeRange[];
  sleepyTimeRanges: TimeRange[];
  sleepTimeRanges: TimeRange[];
  transportOptionIds: TransportOptionId[];
}
