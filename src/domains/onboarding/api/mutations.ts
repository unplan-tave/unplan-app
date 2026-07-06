import { useMutation, useQueryClient } from '@tanstack/react-query';

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
import type { QueryKey, UseMutationOptions } from '@tanstack/react-query';

type SettingsMutationOptions<TVariables> = Omit<
  UseMutationOptions<void, Error, TVariables>,
  'mutationFn'
>;

function useSettingsMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  queryKey: QueryKey,
  options?: SettingsMutationOptions<TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateRecoveryMethodsSettingsMutation(
  options?: SettingsMutationOptions<RecoveryMethodsSettings>,
) {
  return useSettingsMutation(
    submitRecoveryMethodsSettings,
    onboardingSettingsQueryKeys.recoveryMethods(),
    options,
  );
}

export function useUpdateSleepConditionSettingsMutation(
  options?: SettingsMutationOptions<SleepConditionSettings>,
) {
  return useSettingsMutation(
    submitSleepConditionSettings,
    onboardingSettingsQueryKeys.sleepCondition(),
    options,
  );
}

export function useUpdateActivityPatternSettingsMutation(
  options?: SettingsMutationOptions<ActivityPatternSettings>,
) {
  return useSettingsMutation(
    submitActivityPatternSettings,
    onboardingSettingsQueryKeys.activityPattern(),
    options,
  );
}

export function useUpdateTransportSettingsMutation(
  options?: SettingsMutationOptions<TransportOptionId[]>,
) {
  return useSettingsMutation(
    submitTransportSettings,
    onboardingSettingsQueryKeys.transport(),
    options,
  );
}
