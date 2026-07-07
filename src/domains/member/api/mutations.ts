import { useOptimisticQueryMutation } from '@/lib/api/optimistic-query-mutation';

import { submitAlarmSettings, submitMemberProfileUpdate } from './client';
import { memberQueryKeys } from './query-keys';

import type { AlarmSettings, MemberProfile, MemberProfileUpdateInput } from '../model';
import type { OptimisticQueryMutationContext } from '@/lib/api/optimistic-query-mutation';
import type { UseMutationOptions } from '@tanstack/react-query';

type MemberMutationOptions<TData, TVariables, TCache = TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables, OptimisticQueryMutationContext<TCache>>,
  'mutationFn' | 'onMutate'
>;

function mergeMemberProfile(
  previous: MemberProfile | undefined,
  input: MemberProfileUpdateInput,
): MemberProfile {
  return {
    name: previous?.name ?? '',
    nickname: previous?.nickname ?? '',
    email: previous?.email ?? '',
    hasCompletedOnboarding: previous?.hasCompletedOnboarding ?? false,
    ...input,
  };
}

export function useUpdateMemberProfileMutation(
  options?: MemberMutationOptions<void, MemberProfileUpdateInput, MemberProfile>,
) {
  return useOptimisticQueryMutation<void, MemberProfileUpdateInput, MemberProfile>({
    mutationFn: submitMemberProfileUpdate,
    queryKey: memberQueryKeys.profile(),
    toCacheValue: mergeMemberProfile,
    ...options,
  });
}

export function useUpdateAlarmSettingsMutation(
  options?: MemberMutationOptions<void, AlarmSettings, AlarmSettings>,
) {
  return useOptimisticQueryMutation({
    mutationFn: submitAlarmSettings,
    queryKey: memberQueryKeys.alarmSettings(),
    ...options,
  });
}
