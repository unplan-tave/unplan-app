import {
  ConditionType,
  OnboardingRequestTransportationsItem,
  UpdateMethodsDefaultMethodsItem,
} from '@/lib/api/model';

import { parseActivityTimeline, toActivityTimeline } from '../activity-time-ranges';
import { DEFAULT_SLEEP_CONDITION_THRESHOLDS } from '../sleep-condition';

import type {
  ActivityPatternSettings,
  OnboardingPreferences,
  RecoveryMethodsSettings,
  RecoveryOptionId,
  SleepConditionSettings,
  TimeRange,
  TransportOptionId,
} from '../model';
import type {
  BiorhythmRequest,
  GetBiorhythm,
  GetMethods,
  OnboardingRequest,
  OnboardingRequestTransportationsItem as BackendTransportOption,
  SleepConditionResponse,
  TransportRequest,
  TransportResponse,
  UpdateConditions,
  UpdateMethods,
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

const recoveryOptionIdMap: Record<BackendRecoveryOption, Exclude<RecoveryOptionId, 'custom'>> = {
  [UpdateMethodsDefaultMethodsItem.NAP]: 'nap',
  [UpdateMethodsDefaultMethodsItem.MUSIC]: 'music',
  [UpdateMethodsDefaultMethodsItem.WALK]: 'walk',
  [UpdateMethodsDefaultMethodsItem.STRETCHING]: 'stretching',
  [UpdateMethodsDefaultMethodsItem.FOOD]: 'food',
};

const transportOptionIdMap: Record<BackendTransportOption, TransportOptionId> = {
  [OnboardingRequestTransportationsItem.WALK]: 'walk',
  [OnboardingRequestTransportationsItem.BICYCLE]: 'bicycle',
  [OnboardingRequestTransportationsItem.PUBLIC_TRANSPORT]: 'publicTransit',
  [OnboardingRequestTransportationsItem.CAR]: 'car',
};

function toTimeline(ranges: TimeRange[]): string {
  return toActivityTimeline(ranges);
}

export function toRecoveryMethodsSettings(
  response: GetMethods | undefined,
): RecoveryMethodsSettings {
  return {
    recoveryOptionIds: (response?.default_methods ?? []).map(
      (method) => recoveryOptionIdMap[method],
    ),
    customMethods: response?.custom_methods ?? [],
  };
}

export function toUpdateMethodsRequest(settings: RecoveryMethodsSettings): UpdateMethods {
  return {
    default_methods: settings.recoveryOptionIds.map((optionId) => recoveryOptionMap[optionId]),
    custom_methods: settings.customMethods,
  };
}

export function toSleepConditionSettings(
  response: SleepConditionResponse | undefined,
): SleepConditionSettings {
  const thresholds = new Map(
    (response?.conditions ?? []).map((condition) => [condition.type, condition.duration]),
  );

  return {
    targetSleepMinutes: response?.target_duration ?? 450,
    dangerThresholdMinutes:
      thresholds.get(ConditionType.DANGER) ?? DEFAULT_SLEEP_CONDITION_THRESHOLDS.dangerMinutes,
    lackThresholdMinutes:
      thresholds.get(ConditionType.LACK) ?? DEFAULT_SLEEP_CONDITION_THRESHOLDS.lackMinutes,
    optimalThresholdMinutes:
      thresholds.get(ConditionType.OPTIMAL) ?? DEFAULT_SLEEP_CONDITION_THRESHOLDS.optimalMinutes,
  };
}

export function toUpdateConditionsRequest(settings: SleepConditionSettings): UpdateConditions {
  return {
    target_duration: settings.targetSleepMinutes,
    danger_threshold: settings.dangerThresholdMinutes,
    lack_threshold: settings.lackThresholdMinutes,
    optimal_threshold: settings.optimalThresholdMinutes,
  };
}

export function toActivityPatternSettings(
  response: GetBiorhythm | undefined,
): ActivityPatternSettings {
  return {
    focusTimeRanges: parseActivityTimeline(response?.focused_timeline),
    sleepyTimeRanges: parseActivityTimeline(response?.drowsy_timeline),
    sleepTimeRanges: parseActivityTimeline(response?.sleep_timeline),
  };
}

export function toBiorhythmRequest(settings: ActivityPatternSettings): BiorhythmRequest {
  return {
    focused_timeline: toActivityTimeline(settings.focusTimeRanges),
    drowsy_timeline: toActivityTimeline(settings.sleepyTimeRanges),
    sleep_timeline: toActivityTimeline(settings.sleepTimeRanges),
  };
}

export function toTransportOptionIds(response: TransportResponse | undefined): TransportOptionId[] {
  return (response?.transport_types ?? []).map(
    (transportType) => transportOptionIdMap[transportType],
  );
}

export function toTransportRequest(optionIds: TransportOptionId[]): TransportRequest {
  return {
    transport_types: optionIds.map((optionId) => transportOptionMap[optionId]),
  };
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
