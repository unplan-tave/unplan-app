import {
  OnboardingRequestTransportationsItem,
  UpdateMethodsDefaultMethodsItem,
} from '@/lib/api/model';

import { getSelectedActivityHours } from '../activity-time-ranges';

import type {
  OnboardingPreferences,
  RecoveryOptionId,
  TimeRange,
  TransportOptionId,
} from '../model';
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

export function toOnboardingRequest(preferences: OnboardingPreferences): OnboardingRequest {
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
