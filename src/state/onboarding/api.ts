import { isAxiosError } from 'axios';

import { saveOnboarding } from '@/lib/api/endpoints/onboarding/onboarding';
import {
  OnboardingRequestTransportationsItem,
  UpdateMethodsDefaultMethodsItem,
} from '@/lib/api/model';
import { t } from '@/lib/i18n';

import { getSelectedActivityHours } from './activity-time-ranges';

import type {
  OnboardingPreferences,
  RecoveryOptionId,
  TimeRange,
  TransportOptionId,
} from './model';
import type {
  OnboardingRequest,
  OnboardingRequestTransportationsItem as BackendTransportOption,
  UpdateMethodsDefaultMethodsItem as BackendRecoveryOption,
} from '@/lib/api/model';

const recoveryOptionMap: Record<Exclude<RecoveryOptionId, 'custom'>, BackendRecoveryOption> = {
  nap: UpdateMethodsDefaultMethodsItem.NAP,
  music: UpdateMethodsDefaultMethodsItem.MUSIC,
  walk: UpdateMethodsDefaultMethodsItem.WALK,
  stretching: UpdateMethodsDefaultMethodsItem.STRETCHING,
  food: UpdateMethodsDefaultMethodsItem.FOOD,
};

const transportOptionMap: Record<TransportOptionId, BackendTransportOption> = {
  walk: OnboardingRequestTransportationsItem.WALK,
  bicycle: OnboardingRequestTransportationsItem.BICYCLE,
  publicTransit: OnboardingRequestTransportationsItem.PUBLIC_TRANSPORT,
  car: OnboardingRequestTransportationsItem.CAR,
};

function toTimeline(ranges: TimeRange[]): string {
  const selectedHours = getSelectedActivityHours(ranges);

  return Array.from({ length: 24 }, (_, hour) => (selectedHours.has(hour) ? '1' : '0')).join('');
}

function toOnboardingRequest(preferences: OnboardingPreferences): OnboardingRequest {
  const customRecoveryLabel = preferences.customRecoveryLabel?.trim();
  const defaultRecoveryOptions = preferences.recoveryOptionIds
    .filter((optionId): optionId is Exclude<RecoveryOptionId, 'custom'> => optionId !== 'custom')
    .map((optionId) => recoveryOptionMap[optionId]);

  return {
    recovery: {
      default_methods: defaultRecoveryOptions,
      custom_methods: customRecoveryLabel ? [customRecoveryLabel] : [],
    },
    sleep_condition: {
      target_duration: preferences.targetSleepMinutes,
      danger_threshold: preferences.sleepDangerThresholdMinutes,
      lack_threshold: preferences.sleepLackThresholdMinutes,
      optimal_threshold: preferences.sleepOptimalThresholdMinutes,
    },
    biorhythm: {
      focused_timeline: toTimeline(preferences.focusTimeRanges),
      drowsy_timeline: toTimeline(preferences.sleepyTimeRanges),
      sleep_timeline: toTimeline(preferences.sleepTimeRanges),
    },
    transportations: preferences.transportOptionIds.map((optionId) => transportOptionMap[optionId]),
  };
}

export function getOnboardingSubmissionErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }

    return t('onboarding.error.network');
  }

  return error instanceof Error ? error.message : t('onboarding.error.saveFailed');
}

export async function submitOnboarding(preferences: OnboardingPreferences): Promise<void> {
  const response = await saveOnboarding(toOnboardingRequest(preferences));

  if (response.success !== true) {
    throw new Error(response.message ?? t('onboarding.error.saveFailed'));
  }
}
