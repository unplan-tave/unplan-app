import { useOptimisticQueryMutation } from '@/lib/api/optimistic-query-mutation';

import {
  submitActivityPatternSettings,
  submitRecoveryMethodsSettings,
  submitSleepConditionSettings,
  submitTransportSettings,
} from './client';
import { onboardingSettingsQueryKeys } from './query-keys';

import type {
  ActivityPatternSettings,
  RecoveryMethodsSettings,
  SleepConditionSettings,
  TransportOptionId,
} from '../model';
import type { OptimisticQueryMutationContext } from '@/lib/api/optimistic-query-mutation';
import type { UseMutationOptions } from '@tanstack/react-query';

type SettingsMutationOptions<TVariables> = Omit<
  UseMutationOptions<void, Error, TVariables, OptimisticQueryMutationContext<TVariables>>,
  'mutationFn' | 'onMutate'
>;

export function useUpdateRecoveryMethodsSettingsMutation(
  options?: SettingsMutationOptions<RecoveryMethodsSettings>,
) {
  return useOptimisticQueryMutation({
    mutationFn: submitRecoveryMethodsSettings,
    queryKey: onboardingSettingsQueryKeys.recoveryMethods(),
    ...options,
  });
}

export function useUpdateSleepConditionSettingsMutation(
  options?: SettingsMutationOptions<SleepConditionSettings>,
) {
  return useOptimisticQueryMutation({
    mutationFn: submitSleepConditionSettings,
    queryKey: onboardingSettingsQueryKeys.sleepCondition(),
    ...options,
  });
}

export function useUpdateActivityPatternSettingsMutation(
  options?: SettingsMutationOptions<ActivityPatternSettings>,
) {
  return useOptimisticQueryMutation({
    mutationFn: submitActivityPatternSettings,
    queryKey: onboardingSettingsQueryKeys.activityPattern(),
    ...options,
  });
}

export function useUpdateTransportSettingsMutation(
  options?: SettingsMutationOptions<TransportOptionId[]>,
) {
  return useOptimisticQueryMutation({
    mutationFn: submitTransportSettings,
    queryKey: onboardingSettingsQueryKeys.transport(),
    ...options,
  });
}
