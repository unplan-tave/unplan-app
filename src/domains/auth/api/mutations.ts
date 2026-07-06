import { useMutation } from '@tanstack/react-query';

import { submitWithdraw } from './client';

import type { UseMutationOptions } from '@tanstack/react-query';

type AuthMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>;

export function useWithdrawMutation(options?: AuthMutationOptions<void, void>) {
  return useMutation({
    mutationFn: submitWithdraw,
    ...options,
  });
}
