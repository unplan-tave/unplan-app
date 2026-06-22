import { isAxiosError } from 'axios';

import { saveOnboarding } from '@/lib/api/endpoints/onboarding/onboarding';
import {
  OnboardingRequestTransportationsItem,
  UpdateMethodsDefaultMethodsItem,
} from '@/lib/api/model';

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
  const sleepTimeline = toTimeline(preferences.sleepTimeRanges);

  if (defaultRecoveryOptions.length === 0 && !customRecoveryLabel) {
    throw new Error('회복 방법을 한 가지 이상 선택해 주세요.');
  }

  if (!sleepTimeline.includes('1')) {
    throw new Error('수면 시간을 한 시간 이상 선택해 주세요.');
  }

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
      sleep_timeline: sleepTimeline,
    },
    transportations: preferences.transportOptionIds.map((optionId) => transportOptionMap[optionId]),
  };
}

function getSubmissionErrorMessage(error: unknown): string {
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

    return '온보딩 정보를 저장하지 못했습니다. 네트워크 연결을 확인해 주세요.';
  }

  return error instanceof Error ? error.message : '온보딩 정보를 저장하지 못했습니다.';
}

export async function submitOnboarding(preferences: OnboardingPreferences): Promise<void> {
  try {
    const response = await saveOnboarding(toOnboardingRequest(preferences));

    if (response.success !== true) {
      throw new Error(response.message ?? '온보딩 정보를 저장하지 못했습니다.');
    }
  } catch (error: unknown) {
    throw new Error(getSubmissionErrorMessage(error));
  }
}
