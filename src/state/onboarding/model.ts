export type RecoveryOptionId = 'nap' | 'music' | 'walk' | 'stretching' | 'food' | 'custom';

export type TransportOptionId = 'walk' | 'bicycle' | 'publicTransit' | 'car';

export interface TimeRange {
  startHour: number;
  endHour: number;
}

export interface OnboardingPreferences {
  recoveryOptionIds: RecoveryOptionId[];
  customRecoveryLabel: string | null;
  targetSleepMinutes: number;
  focusTimeRanges: TimeRange[];
  sleepyTimeRanges: TimeRange[];
  sleepTimeRanges: TimeRange[];
  transportOptionIds: TransportOptionId[];
}
