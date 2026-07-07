import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MutationFunctionContext, QueryKey, UseMutationOptions } from '@tanstack/react-query';

export type OptimisticQueryMutationContext<TCache> = {
  previous?: TCache;
};

type OptimisticQueryMutationOptions<TData, TVariables, TCache> = Omit<
  UseMutationOptions<TData, Error, TVariables, OptimisticQueryMutationContext<TCache>>,
  'mutationFn' | 'onMutate'
>;

type UseOptimisticQueryMutationParams<TData, TVariables, TCache> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: QueryKey;
  /** variables를 query cache 값으로 변환합니다. 생략 시 variables를 그대로 씁니다(1:1). */
  toCacheValue?: (previous: TCache | undefined, variables: TVariables) => TCache;
} & OptimisticQueryMutationOptions<TData, TVariables, TCache>;

function getMutationScopeId(queryKey: QueryKey): string {
  return JSON.stringify(queryKey);
}

export function useOptimisticQueryMutation<TData, TVariables, TCache = TVariables>({
  mutationFn,
  queryKey,
  toCacheValue,
  ...options
}: UseOptimisticQueryMutationParams<TData, TVariables, TCache>) {
  const queryClient = useQueryClient();
  const resolveCacheValue =
    toCacheValue ??
    ((_: TCache | undefined, variables: TVariables) => variables as unknown as TCache);

  return useMutation<TData, Error, TVariables, OptimisticQueryMutationContext<TCache>>({
    mutationFn,
    scope: { id: getMutationScopeId(queryKey) },
    ...options,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TCache>(queryKey);
      queryClient.setQueryData(queryKey, resolveCacheValue(previous, variables));
      return { previous };
    },
    onError: (error, variables, onMutateResult, context: MutationFunctionContext) => {
      if (onMutateResult?.previous !== undefined) {
        queryClient.setQueryData(queryKey, onMutateResult.previous);
      }

      options.onError?.(error, variables, onMutateResult, context);
    },
    onSuccess: (data, variables, onMutateResult, context: MutationFunctionContext) => {
      queryClient.setQueryData(
        queryKey,
        resolveCacheValue(queryClient.getQueryData<TCache>(queryKey), variables),
      );

      options.onSuccess?.(data, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context: MutationFunctionContext) => {
      void queryClient.invalidateQueries({ queryKey });
      options.onSettled?.(data, error, variables, onMutateResult, context);
    },
  });
}
