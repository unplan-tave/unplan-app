/**
 * onboarding flow의 클라이언트 상태 저장소입니다.
 * 여러 onboarding 화면에서 입력한 draft를 모아 최종 submit 시 onboarding API로 전달합니다.
 */
import { produce } from 'immer';
import { create } from 'zustand';

import { t } from '@/lib/i18n';

import { toggleActivityHourRange, toggleContinuousSleepRange } from './activity-time-ranges';
import { getOnboardingSubmissionErrorMessage, submitOnboarding } from './api/client';
import { validateOnboardingPreferences } from './validation';

import type { OnboardingPreferences, RecoveryOptionId, TransportOptionId } from './model';

const initialPreferences: OnboardingPreferences = {
  recoveryOptionIds: [],
  customRecoveryLabel: null,
  targetSleepMinutes: 450,
  sleepDangerThresholdMinutes: 180,
  sleepLackThresholdMinutes: 360,
  sleepOptimalThresholdMinutes: 540,
  focusTimeRanges: [],
  sleepyTimeRanges: [],
  sleepTimeRanges: [],
  transportOptionIds: [],
};

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isSubmitting: boolean;
  submissionError: string | null;
  preferences: OnboardingPreferences;
  hydrateOnboarding: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  toggleRecoveryOption: (optionId: RecoveryOptionId) => void;
  setCustomRecoveryLabel: (label: string | null) => void;
  setTargetSleepMinutes: (minutes: number) => void;
  setSleepConditionThresholds: (thresholds: {
    dangerMinutes: number;
    lackMinutes: number;
    optimalMinutes: number;
  }) => void;
  toggleActivityHour: (
    rangeKey: 'focusTimeRanges' | 'sleepyTimeRanges' | 'sleepTimeRanges',
    hour: number,
  ) => void;
  toggleTransportOption: (optionId: TransportOptionId) => void;
  completeOnboarding: (options?: { skipTransport?: boolean }) => Promise<boolean>;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  hasCompletedOnboarding: false,
  isSubmitting: false,
  submissionError: null,
  preferences: initialPreferences,

  hydrateOnboarding: () => {
    set(
      produce((state: OnboardingState) => {
        state.hasCompletedOnboarding = false;
      }),
    );
  },

  setOnboardingCompleted: (completed) => {
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

  setSleepConditionThresholds: (thresholds) =>
    set(
      produce((state: OnboardingState) => {
        state.preferences.sleepDangerThresholdMinutes = thresholds.dangerMinutes;
        state.preferences.sleepLackThresholdMinutes = thresholds.lackMinutes;
        state.preferences.sleepOptimalThresholdMinutes = thresholds.optimalMinutes;
      }),
    ),

  toggleActivityHour: (rangeKey, hour) =>
    set(
      produce((state: OnboardingState) => {
        const ranges = state.preferences[rangeKey];

        state.preferences[rangeKey] =
          rangeKey === 'sleepTimeRanges'
            ? toggleContinuousSleepRange(ranges, hour)
            : toggleActivityHourRange(ranges, hour);
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

  completeOnboarding: async (options) => {
    if (get().isSubmitting) {
      return false;
    }

    const preferences = get().preferences;
    const submissionPreferences = options?.skipTransport
      ? { ...preferences, transportOptionIds: [] }
      : preferences;
    const validationErrorKey = validateOnboardingPreferences(submissionPreferences);

    if (validationErrorKey) {
      set(
        produce((state: OnboardingState) => {
          state.submissionError = t(validationErrorKey);
        }),
      );

      return false;
    }

    set(
      produce((state: OnboardingState) => {
        state.isSubmitting = true;
        state.submissionError = null;
        state.hasCompletedOnboarding = true;
      }),
    );

    try {
      await submitOnboarding(submissionPreferences);

      return true;
    } catch (error: unknown) {
      set(
        produce((state: OnboardingState) => {
          state.submissionError = getOnboardingSubmissionErrorMessage(error);
        }),
      );

      return true;
    } finally {
      set(
        produce((state: OnboardingState) => {
          state.isSubmitting = false;
        }),
      );
    }
  },

  resetOnboarding: () => {
    set(
      produce((state: OnboardingState) => {
        state.hasCompletedOnboarding = false;
        state.isSubmitting = false;
        state.submissionError = null;
        state.preferences = initialPreferences;
      }),
    );
  },
}));
