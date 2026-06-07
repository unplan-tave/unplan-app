import { produce } from 'immer';
import { create } from 'zustand';

import { mmkvStorage } from '@/lib/storage/mmkv-storage';

import type {
  OnboardingPreferences,
  RecoveryOptionId,
  TimeRange,
  TransportOptionId,
} from './model';

const ONBOARDING_COMPLETED_KEY = 'onboarding.completed';

const initialPreferences: OnboardingPreferences = {
  recoveryOptionIds: [],
  customRecoveryLabel: null,
  targetSleepMinutes: 450,
  focusTimeRanges: [],
  sleepyTimeRanges: [],
  sleepTimeRanges: [],
  transportOptionIds: [],
};

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  preferences: OnboardingPreferences;
  hydrateOnboarding: () => void;
  toggleRecoveryOption: (optionId: RecoveryOptionId) => void;
  setCustomRecoveryLabel: (label: string | null) => void;
  setTargetSleepMinutes: (minutes: number) => void;
  toggleActivityHour: (
    rangeKey: 'focusTimeRanges' | 'sleepyTimeRanges' | 'sleepTimeRanges',
    hour: number,
  ) => void;
  toggleTransportOption: (optionId: TransportOptionId) => void;
  completeOnboarding: () => void;
}

function toggleHourRange(ranges: TimeRange[], hour: number): TimeRange[] {
  const existingIndex = ranges.findIndex((range) => range.startHour === hour);

  if (existingIndex >= 0) {
    return ranges.filter((_, index) => index !== existingIndex);
  }

  return [...ranges, { startHour: hour, endHour: (hour + 1) % 24 }].sort(
    (first, second) => first.startHour - second.startHour,
  );
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  hasCompletedOnboarding: false,
  preferences: initialPreferences,

  hydrateOnboarding: () => {
    const completed = mmkvStorage.get(ONBOARDING_COMPLETED_KEY) === 'true';

    set(
      produce((state: OnboardingState) => {
        state.hasCompletedOnboarding = completed;
      }),
    );
  },

  toggleRecoveryOption: (optionId: RecoveryOptionId) =>
    set(
      produce((state: OnboardingState) => {
        const isSelected = state.preferences.recoveryOptionIds.includes(optionId);

        state.preferences.recoveryOptionIds = isSelected
          ? state.preferences.recoveryOptionIds.filter((selectedId) => selectedId !== optionId)
          : [...state.preferences.recoveryOptionIds, optionId];

        if (optionId === 'custom' && isSelected) {
          state.preferences.customRecoveryLabel = null;
        }
      }),
    ),

  setCustomRecoveryLabel: (label: string | null) =>
    set(
      produce((state: OnboardingState) => {
        state.preferences.customRecoveryLabel = label;
      }),
    ),

  setTargetSleepMinutes: (minutes: number) =>
    set(
      produce((state: OnboardingState) => {
        state.preferences.targetSleepMinutes = minutes;
      }),
    ),

  toggleActivityHour: (rangeKey, hour) =>
    set(
      produce((state: OnboardingState) => {
        state.preferences[rangeKey] = toggleHourRange(state.preferences[rangeKey], hour);
      }),
    ),

  toggleTransportOption: (optionId: TransportOptionId) =>
    set(
      produce((state: OnboardingState) => {
        const isSelected = state.preferences.transportOptionIds.includes(optionId);

        state.preferences.transportOptionIds = isSelected
          ? state.preferences.transportOptionIds.filter((selectedId) => selectedId !== optionId)
          : [...state.preferences.transportOptionIds, optionId];
      }),
    ),

  completeOnboarding: () => {
    mmkvStorage.set(ONBOARDING_COMPLETED_KEY, 'true');

    set(
      produce((state: OnboardingState) => {
        state.hasCompletedOnboarding = true;
      }),
    );
  },
}));
