/**
 * onboarding settings 조회 hook 모음입니다.
 * settings 화면이 필요한 recovery/sleep/activity/transport 설정을 독립 query로 가져옵니다.
 */
import { useQuery } from '@tanstack/react-query';

import {
  fetchActivityPatternSettings,
  fetchRecoveryMethodsSettings,
  fetchSleepConditionSettings,
  fetchTransportSettings,
} from './client';
import { onboardingQueryKeys } from './query-keys';

import type {
  ActivityPatternSettings,
  RecoveryMethodsSettings,
  SleepConditionSettings,
  TransportOptionId,
} from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type SettingsQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

export function useRecoveryMethodsSettingsQuery(
  options?: SettingsQueryOptions<RecoveryMethodsSettings>,
) {
  return useQuery({
    queryKey: onboardingQueryKeys.recoveryMethods(),
    queryFn: fetchRecoveryMethodsSettings,
    ...options,
  });
}

export function useSleepConditionSettingsQuery(
  options?: SettingsQueryOptions<SleepConditionSettings>,
) {
  return useQuery({
    queryKey: onboardingQueryKeys.sleepCondition(),
    queryFn: fetchSleepConditionSettings,
    ...options,
  });
}

export function useActivityPatternSettingsQuery(
  options?: SettingsQueryOptions<ActivityPatternSettings>,
) {
  return useQuery({
    queryKey: onboardingQueryKeys.activityPattern(),
    queryFn: fetchActivityPatternSettings,
    ...options,
  });
}

export function useTransportSettingsQuery(options?: SettingsQueryOptions<TransportOptionId[]>) {
  return useQuery({
    queryKey: onboardingQueryKeys.transport(),
    queryFn: fetchTransportSettings,
    ...options,
  });
}
