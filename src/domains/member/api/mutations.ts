import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitMemberProfileUpdate } from './client';
import { memberQueryKeys } from './query-keys';

import type { MemberProfileUpdateInput } from '../model';
import type { UseMutationOptions } from '@tanstack/react-query';

type MemberMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>;

export function useUpdateMemberProfileMutation(
  options?: MemberMutationOptions<void, MemberProfileUpdateInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMemberProfileUpdate,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.profile() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
